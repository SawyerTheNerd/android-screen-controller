import { useState, useCallback, useRef, useEffect } from "react";
import type { AdbScrcpyClient } from "@yume-chan/adb-scrcpy";
import { createDecoder, type VideoDecoder } from "../lib/video/decoder.js";

interface UseVideoDecoderResult {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  videoWidth: number;
  videoHeight: number;
  isHardwareAccelerated: boolean;
  startDecoding: (client: AdbScrcpyClient<any>) => Promise<void>;
  stopDecoding: () => void;
  getCanvas: () => HTMLCanvasElement | null;
}

export function useVideoDecoder(): UseVideoDecoderResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const decoderRef = useRef<VideoDecoder | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [videoWidth, setVideoWidth] = useState(0);
  const [videoHeight, setVideoHeight] = useState(0);
  const [isHardwareAccelerated, setIsHardwareAccelerated] = useState(false);

  const stopDecoding = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    decoderRef.current?.dispose();
    decoderRef.current = null;

    // Remove canvas from container
    if (containerRef.current && canvasRef.current) {
      containerRef.current.removeChild(canvasRef.current);
    }
    canvasRef.current = null;
    setVideoWidth(0);
    setVideoHeight(0);
  }, []);

  const startDecoding = useCallback(
    async (client: AdbScrcpyClient<any>) => {
      stopDecoding();

      const videoStreamPromise = client.videoStream;
      if (!videoStreamPromise) return;

      const { decoder, canvas, isHardwareAccelerated: hwAccel } = createDecoder();
      decoderRef.current = decoder;
      canvasRef.current = canvas;
      setIsHardwareAccelerated(hwAccel);

      // Style the canvas to fill container while maintaining aspect ratio
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.objectFit = "contain";
      canvas.style.display = "block";
      canvas.style.touchAction = "none";

      // Add canvas to container
      if (containerRef.current) {
        containerRef.current.appendChild(canvas);
      }

      // Listen for size changes (e.g. device rotation)
      const removeSizeListener = decoder.sizeChanged((size) => {
        setVideoWidth(size.width);
        setVideoHeight(size.height);
      });

      // Get the video stream and pipe to decoder
      const videoStream = await videoStreamPromise;
      setVideoWidth(videoStream.width);
      setVideoHeight(videoStream.height);

      const abortController = new AbortController();
      abortRef.current = abortController;

      void videoStream.stream
        .pipeTo(decoder.writable, { signal: abortController.signal })
        .catch((e: unknown) => {
          if (e instanceof Error && e.name === "AbortError") return;
          console.error("Video stream error:", e);
        })
        .finally(() => {
          removeSizeListener();
        });
    },
    [stopDecoding]
  );

  const getCanvas = useCallback(() => canvasRef.current, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      decoderRef.current?.dispose();
    };
  }, []);

  return {
    canvasRef: containerRef,
    videoWidth,
    videoHeight,
    isHardwareAccelerated,
    startDecoding,
    stopDecoding,
    getCanvas,
  };
}
