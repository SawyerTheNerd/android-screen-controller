import {
  WebCodecsVideoDecoder,
  WebGLVideoFrameRenderer,
  BitmapVideoFrameRenderer,
} from "@yume-chan/scrcpy-decoder-webcodecs";
import { TinyH264Decoder } from "@yume-chan/scrcpy-decoder-tinyh264";
import { ScrcpyVideoCodecId } from "@yume-chan/scrcpy";

export type VideoDecoder = WebCodecsVideoDecoder | TinyH264Decoder;

export interface DecoderResult {
  decoder: VideoDecoder;
  canvas: HTMLCanvasElement;
  isHardwareAccelerated: boolean;
}

export function createDecoder(): DecoderResult {
  // Try WebCodecs + WebGL (best performance)
  if (WebCodecsVideoDecoder.isSupported && WebGLVideoFrameRenderer.isSupported) {
    try {
      const renderer = new WebGLVideoFrameRenderer(undefined, true);
      const decoder = new WebCodecsVideoDecoder({
        codec: ScrcpyVideoCodecId.H264,
        renderer,
      });
      return {
        decoder,
        canvas: renderer.canvas as HTMLCanvasElement,
        isHardwareAccelerated: true,
      };
    } catch (e) {
      console.warn("WebGL renderer failed, trying bitmap fallback:", e);
    }
  }

  // Try WebCodecs + Bitmap canvas (WebGL unavailable)
  if (WebCodecsVideoDecoder.isSupported) {
    try {
      const renderer = new BitmapVideoFrameRenderer();
      const decoder = new WebCodecsVideoDecoder({
        codec: ScrcpyVideoCodecId.H264,
        renderer,
      });
      return {
        decoder,
        canvas: renderer.canvas as HTMLCanvasElement,
        isHardwareAccelerated: true,
      };
    } catch (e) {
      console.warn("WebCodecs bitmap renderer failed, falling back to TinyH264:", e);
    }
  }

  // Fallback to TinyH264 software decoder (always works)
  const decoder = new TinyH264Decoder();
  return {
    decoder,
    canvas: decoder.renderer as HTMLCanvasElement,
    isHardwareAccelerated: false,
  };
}
