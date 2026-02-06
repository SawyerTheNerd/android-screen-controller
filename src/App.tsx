import { useCallback, useEffect, useRef, useState } from "react";
import { useBrowserCompat } from "./hooks/useBrowserCompat.js";
import { useDeviceConnection } from "./hooks/useDeviceConnection.js";
import { useScrcpySession } from "./hooks/useScrcpySession.js";
import { useVideoDecoder } from "./hooks/useVideoDecoder.js";
import { useAudioPlayer } from "./hooks/useAudioPlayer.js";
import { useInputHandlers } from "./hooks/useInputHandlers.js";
import { useFullscreen } from "./hooks/useFullscreen.js";
import { useScreenshot } from "./hooks/useScreenshot.js";
import { ConnectionState } from "./types/index.js";
import { BrowserCheck } from "./components/connection/BrowserCheck.js";
import { ConnectionPanel } from "./components/connection/ConnectionPanel.js";
import { AppHeader } from "./components/layout/AppHeader.js";
import { Sidebar } from "./components/layout/Sidebar.js";
import { ScreenViewer } from "./components/viewer/ScreenViewer.js";
import { Toast } from "./components/ui/Toast.js";

export default function App() {
  const compat = useBrowserCompat();
  const {
    connectionState,
    setConnectionState,
    adb,
    deviceInfo,
    error,
    setError,
    connect,
    disconnect,
  } = useDeviceConnection();

  const { client, startSession, stopSession } = useScrcpySession({
    adb,
    onStateChange: setConnectionState,
    onError: setError,
  });

  const {
    canvasRef,
    videoWidth,
    videoHeight,
    isHardwareAccelerated,
    startDecoding,
    stopDecoding,
    getCanvas,
  } = useVideoDecoder();

  const { startAudio, stopAudio } = useAudioPlayer();

  const viewerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(viewerRef);
  const { takeScreenshot } = useScreenshot(getCanvas);

  const [toast, setToast] = useState<{
    message: string;
    type: "info" | "error" | "success";
  } | null>(null);

  // Auto-start scrcpy session when connected
  useEffect(() => {
    if (connectionState === ConnectionState.Connected && adb) {
      startSession();
    }
  }, [connectionState, adb, startSession]);

  // Start video decoding when client is ready
  useEffect(() => {
    if (client) {
      startDecoding(client);
    }
    return () => {
      stopDecoding();
    };
  }, [client, startDecoding, stopDecoding]);

  // Start audio playback when client is ready
  useEffect(() => {
    if (client) {
      startAudio(client);
    }
    return () => {
      stopAudio();
    };
  }, [client, startAudio, stopAudio]);

  // Setup input handlers
  const getVideoDimensions = useCallback(
    () => ({ width: videoWidth, height: videoHeight }),
    [videoWidth, videoHeight]
  );
  useInputHandlers(client?.controller, getCanvas, getVideoDimensions);

  const handleRotate = useCallback(async () => {
    try {
      await client?.controller?.rotateDevice();
    } catch {
      setToast({ message: "Failed to rotate device", type: "error" });
    }
  }, [client]);

  const handleDisconnect = useCallback(async () => {
    stopAudio();
    await stopSession();
    stopDecoding();
    await disconnect();
  }, [stopAudio, stopSession, stopDecoding, disconnect]);

  const handleRetry = useCallback(async () => {
    await handleDisconnect();
    connect();
  }, [handleDisconnect, connect]);

  const handleScreenshot = useCallback(() => {
    takeScreenshot();
    setToast({ message: "Screenshot saved", type: "success" });
  }, [takeScreenshot]);

  const showMainUI =
    connectionState === ConnectionState.Connected ||
    connectionState === ConnectionState.PushingServer ||
    connectionState === ConnectionState.StartingStream ||
    connectionState === ConnectionState.Streaming;

  const isBlocked = !compat.hasWebUSB || !compat.isSecureContext;

  return (
    <div className="h-full flex flex-col bg-[#0f0f0f]">
      <BrowserCheck compat={compat} />
      <AppHeader
        state={connectionState}
        deviceName={deviceInfo?.model}
        onDisconnect={handleDisconnect}
      />

      <div className="flex-1 flex overflow-hidden">
        {showMainUI ? (
          <>
            <Sidebar
              deviceInfo={deviceInfo}
              controller={client?.controller}
              videoWidth={videoWidth}
              videoHeight={videoHeight}
              isHardwareAccelerated={isHardwareAccelerated}
            />
            <ScreenViewer
              canvasContainerRef={canvasRef}
              viewerRef={viewerRef}
              state={connectionState}
              videoWidth={videoWidth}
              videoHeight={videoHeight}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              onScreenshot={handleScreenshot}
              onRotate={handleRotate}
            />
          </>
        ) : (
          <ConnectionPanel
            state={connectionState}
            error={error}
            onConnect={connect}
            onDisconnect={handleDisconnect}
            onRetry={handleRetry}
            disabled={isBlocked}
          />
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
