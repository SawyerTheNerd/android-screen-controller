import type { RefObject } from "react";
import { ViewerOverlay } from "./ViewerOverlay.js";
import { ViewerToolbar } from "./ViewerToolbar.js";
import { ConnectionState } from "../../types/index.js";

interface ScreenViewerProps {
  canvasContainerRef: RefObject<HTMLDivElement | null>;
  viewerRef: RefObject<HTMLDivElement | null>;
  state: ConnectionState;
  videoWidth: number;
  videoHeight: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onScreenshot: () => void;
  onRotate: () => void;
}

export function ScreenViewer({
  canvasContainerRef,
  viewerRef,
  state,
  videoWidth,
  videoHeight,
  isFullscreen,
  onToggleFullscreen,
  onScreenshot,
  onRotate,
}: ScreenViewerProps) {
  const isLoading =
    state === ConnectionState.PushingServer ||
    state === ConnectionState.StartingStream;
  const isStreaming = state === ConnectionState.Streaming;

  return (
    <div
      ref={viewerRef}
      className="flex-1 flex items-center justify-center bg-black relative overflow-hidden"
    >
      {isLoading && <ViewerOverlay state={state} />}

      <div
        ref={canvasContainerRef}
        className={`relative ${isStreaming ? "block" : "hidden"}`}
        style={{
          width: isFullscreen ? "100%" : undefined,
          height: isFullscreen ? "100%" : undefined,
          maxWidth: "100%",
          maxHeight: "100%",
          aspectRatio: videoWidth && videoHeight ? `${videoWidth}/${videoHeight}` : undefined,
        }}
      />

      {isStreaming && (
        <ViewerToolbar
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
          onScreenshot={onScreenshot}
          onRotate={onRotate}
        />
      )}
    </div>
  );
}
