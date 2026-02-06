import { useState, useCallback, useRef, useEffect } from "react";
import type { Adb } from "@yume-chan/adb";
import type { AdbScrcpyClient } from "@yume-chan/adb-scrcpy";
import { ScrcpySessionManager } from "../lib/scrcpy/client.js";
import { ConnectionState, type ScrcpyConfig } from "../types/index.js";

interface UseScrcpySessionOptions {
  adb: Adb | null;
  onStateChange: (state: ConnectionState) => void;
  onError: (message: string) => void;
}

export function useScrcpySession({
  adb,
  onStateChange,
  onError,
}: UseScrcpySessionOptions) {
  const [client, setClient] = useState<AdbScrcpyClient<any> | null>(null);
  const sessionRef = useRef<ScrcpySessionManager | null>(null);
  const startingRef = useRef(false);

  const startSession = useCallback(
    async (config?: ScrcpyConfig) => {
      if (!adb || startingRef.current) return;
      startingRef.current = true;

      try {
        const session = new ScrcpySessionManager(adb);
        sessionRef.current = session;

        onStateChange(ConnectionState.PushingServer);
        await session.pushServer();

        onStateChange(ConnectionState.StartingStream);
        const scrcpyClient = await session.start(config);
        setClient(scrcpyClient);

        onStateChange(ConnectionState.Streaming);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to start screen mirror";
        onError(message);
        onStateChange(ConnectionState.Error);
      } finally {
        startingRef.current = false;
      }
    },
    [adb, onStateChange, onError]
  );

  const stopSession = useCallback(async () => {
    await sessionRef.current?.stop();
    sessionRef.current = null;
    setClient(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      sessionRef.current?.stop();
    };
  }, []);

  return { client, startSession, stopSession };
}
