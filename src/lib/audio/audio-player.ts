import type { ScrcpyMediaStreamPacket } from "@yume-chan/scrcpy";
import type { ReadableStream } from "@yume-chan/stream-extra";
import { WritableStream } from "@yume-chan/stream-extra";

/**
 * Plays audio from a scrcpy audio stream using the WebCodecs AudioDecoder API.
 * Supports Opus, AAC, and FLAC codecs.
 *
 * Key notes:
 * - Scrcpy sends raw Opus frames, NOT Ogg-encapsulated Opus.
 * - WebCodecs AudioDecoder for Opus: if `description` is omitted, the bitstream
 *   is assumed to be raw opus format (what scrcpy sends). If `description` IS
 *   provided, it's treated as Ogg format — which would be WRONG for scrcpy.
 * - All Opus frames are independent (keyframes). No delta frames exist.
 */
export class AudioPlayer {
  private audioContext: AudioContext | null = null;
  private decoder: AudioDecoder | null = null;
  private abortController: AbortController | null = null;
  private _playing = false;

  // Schedule audio buffers for gapless playback
  private nextStartTime = 0;

  get playing(): boolean {
    return this._playing;
  }

  /**
   * Start playing audio from the scrcpy audio stream.
   * @param stream The audio packet stream from scrcpy
   * @param codecId The WebCodecs codec string (e.g., "opus", "mp4a.66", "flac")
   */
  async start(
    stream: ReadableStream<ScrcpyMediaStreamPacket>,
    codecId: string
  ): Promise<void> {
    this.stop();

    // Create AudioContext. Browsers may create it in "suspended" state
    // due to autoplay policy, so we must explicitly resume it.
    this.audioContext = new AudioContext({ sampleRate: 48000 });

    // Resume the AudioContext — this is crucial for autoplay policy compliance.
    // The user's "Connect" button click should provide the required user gesture.
    if (this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn("[AudioPlayer] Failed to resume AudioContext:", e);
      }
    }

    this.nextStartTime = 0;

    const audioContext = this.audioContext;

    this.decoder = new AudioDecoder({
      output: (audioData: AudioData) => {
        try {
          this.handleDecodedAudio(audioContext, audioData);
        } finally {
          audioData.close();
        }
      },
      error: (e: DOMException) => {
        console.error("[AudioPlayer] Decoder error:", e);
      },
    });

    // Configure the decoder.
    // For Opus: do NOT provide `description` — scrcpy sends raw opus frames,
    // not Ogg-encapsulated. WebCodecs treats absence of description as raw opus.
    // Scrcpy default is 48kHz stereo for Opus.
    this.decoder.configure({
      codec: codecId,
      sampleRate: 48000,
      numberOfChannels: 2,
    });

    console.debug(
      "[AudioPlayer] Decoder configured with codec:",
      codecId,
      "state:",
      this.decoder.state
    );

    this.abortController = new AbortController();
    this._playing = true;

    // Pipe the audio stream through a WritableStream that feeds the decoder
    void stream
      .pipeTo(
        new WritableStream<ScrcpyMediaStreamPacket>({
          write: (packet) => {
            if (!this.decoder || this.decoder.state === "closed") return;

            if (packet.type === "configuration") {
              // For Opus, the configuration packet from scrcpy is NOT a valid
              // Ogg Identification Header. Providing it as `description` would
              // make WebCodecs think the stream is Ogg-encapsulated, causing
              // decode failures. So we skip configuration packets for Opus.
              //
              // For AAC/FLAC, the configuration packet may contain codec-specific
              // setup data that WebCodecs needs as `description`.
              if (codecId !== "opus") {
                try {
                  this.decoder.configure({
                    codec: codecId,
                    sampleRate: 48000,
                    numberOfChannels: 2,
                    description: packet.data,
                  });
                } catch (e) {
                  console.warn(
                    "[AudioPlayer] Failed to reconfigure with description:",
                    e
                  );
                }
              }
              return;
            }

            if (packet.type === "data") {
              try {
                // Opus frames are always independent (keyframes).
                // For other codecs, respect the keyframe flag from scrcpy.
                const isKey =
                  codecId === "opus" ? true : packet.keyframe !== false;

                this.decoder.decode(
                  new EncodedAudioChunk({
                    type: isKey ? "key" : "delta",
                    timestamp:
                      packet.pts !== undefined ? Number(packet.pts) : 0,
                    data: packet.data,
                  })
                );
              } catch (e) {
                console.warn("[AudioPlayer] Decode error (skipping packet):", e);
              }
            }
          },
        }),
        { signal: this.abortController.signal }
      )
      .catch((e: unknown) => {
        if (e instanceof Error && e.name === "AbortError") return;
        console.error("[AudioPlayer] Stream pipe error:", e);
      })
      .finally(() => {
        this._playing = false;
      });
  }

  /**
   * Handle a decoded AudioData frame by scheduling it for playback
   * through the Web Audio API.
   */
  private handleDecodedAudio(
    audioContext: AudioContext,
    audioData: AudioData
  ): void {
    if (audioContext.state === "closed") return;

    // Resume if still suspended (can happen if the initial resume didn't
    // succeed yet because there was no recent user gesture)
    if (audioContext.state === "suspended") {
      void audioContext.resume();
    }

    const numberOfChannels = audioData.numberOfChannels;
    const numberOfFrames = audioData.numberOfFrames;
    const sampleRate = audioData.sampleRate;

    if (numberOfFrames === 0) return;

    // Create an AudioBuffer from the decoded data
    const audioBuffer = audioContext.createBuffer(
      numberOfChannels,
      numberOfFrames,
      sampleRate
    );

    // Copy each channel's float32 PCM data
    for (let ch = 0; ch < numberOfChannels; ch++) {
      const channelData = new Float32Array(numberOfFrames);
      try {
        audioData.copyTo(channelData, {
          planeIndex: ch,
          format: "f32-planar",
        });
      } catch {
        // Some AudioData may not support f32-planar; try without format
        try {
          audioData.copyTo(channelData, { planeIndex: ch });
        } catch (e2) {
          console.warn("[AudioPlayer] Failed to copy audio channel data:", e2);
          return;
        }
      }
      audioBuffer.copyToChannel(channelData, ch);
    }

    // Schedule the buffer for gapless playback
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    const currentTime = audioContext.currentTime;
    const duration = numberOfFrames / sampleRate;

    // If we've fallen behind (e.g. tab was backgrounded), catch up
    if (this.nextStartTime < currentTime) {
      // Add small offset to avoid scheduling in the past
      this.nextStartTime = currentTime + 0.01;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += duration;
  }

  /**
   * Stop audio playback and release resources.
   */
  stop(): void {
    this._playing = false;
    this.abortController?.abort();
    this.abortController = null;

    try {
      if (this.decoder && this.decoder.state !== "closed") {
        this.decoder.close();
      }
    } catch {
      // Ignore errors during cleanup
    }
    this.decoder = null;

    try {
      void this.audioContext?.close();
    } catch {
      // Ignore errors during cleanup
    }
    this.audioContext = null;
    this.nextStartTime = 0;
  }
}
