import { useCallback, useRef, useEffect } from "react";
import type { AdbScrcpyClient } from "@yume-chan/adb-scrcpy";
import { WritableStream } from "@yume-chan/stream-extra";
import { AudioPlayer } from "../lib/audio/audio-player.js";

export function useAudioPlayer() {
  const playerRef = useRef<AudioPlayer | null>(null);
  const startingRef = useRef(false);

  const startAudio = useCallback(async (client: AdbScrcpyClient<any>) => {
    // Guard against double-invocation (React StrictMode)
    if (startingRef.current) return;
    startingRef.current = true;

    try {
      // Stop any existing player
      playerRef.current?.stop();
      playerRef.current = null;

      const audioStreamPromise = client.audioStream;
      if (!audioStreamPromise) {
        console.debug("[useAudioPlayer] No audio stream available (audio disabled or unsupported server version)");
        return;
      }

      console.debug("[useAudioPlayer] Awaiting audio stream metadata...");
      const metadata = await audioStreamPromise;
      console.debug("[useAudioPlayer] Audio stream metadata type:", metadata.type);

      if (metadata.type === "disabled") {
        console.debug("[useAudioPlayer] Audio is disabled on the server side");
        return;
      }

      if (metadata.type === "errored") {
        console.warn("[useAudioPlayer] Audio stream errored on the server side");
        return;
      }

      // metadata.type === "success"
      const { codec, stream } = metadata;
      const codecId = codec.webCodecId;
      console.debug("[useAudioPlayer] Audio codec:", codec.mimeType, "webCodecId:", codecId);

      if (!codecId) {
        console.warn("[useAudioPlayer] No WebCodecs ID for audio codec — consuming stream silently");
        void stream
          .pipeTo(new WritableStream({ write() {} }))
          .catch(() => {});
        return;
      }

      // Check if AudioDecoder is available in this browser
      if (typeof AudioDecoder === "undefined") {
        console.warn("[useAudioPlayer] AudioDecoder API not available — consuming stream silently");
        void stream
          .pipeTo(new WritableStream({ write() {} }))
          .catch(() => {});
        return;
      }

      // Check if the codec is supported
      try {
        const support = await AudioDecoder.isConfigSupported({
          codec: codecId,
          sampleRate: 48000,
          numberOfChannels: 2,
        });
        console.debug("[useAudioPlayer] AudioDecoder.isConfigSupported:", support.supported);
        if (!support.supported) {
          console.warn("[useAudioPlayer] AudioDecoder does not support codec:", codecId);
          void stream
            .pipeTo(new WritableStream({ write() {} }))
            .catch(() => {});
          return;
        }
      } catch (e) {
        console.warn("[useAudioPlayer] Failed to check codec support:", e);
      }

      const player = new AudioPlayer();
      playerRef.current = player;
      await player.start(stream, codecId);
      console.debug("[useAudioPlayer] Audio playback started successfully");
    } catch (e) {
      console.error("[useAudioPlayer] Failed to start audio:", e);
    } finally {
      startingRef.current = false;
    }
  }, []);

  const stopAudio = useCallback(() => {
    playerRef.current?.stop();
    playerRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playerRef.current?.stop();
    };
  }, []);

  return { startAudio, stopAudio };
}
