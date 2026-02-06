import { useState, useCallback, useRef, useEffect } from "react";
import type { Adb } from "@yume-chan/adb";
import { DeviceManager } from "../lib/adb/device-manager.js";
import { ConnectionState, type DeviceInfo } from "../types/index.js";

export function useDeviceConnection() {
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected);
  const [adb, setAdb] = useState<Adb | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const managerRef = useRef(new DeviceManager());

  const connect = useCallback(async () => {
    const manager = managerRef.current;
    if (!manager.isSupported) {
      setError("WebUSB is not supported in this browser.");
      setConnectionState(ConnectionState.Error);
      return;
    }

    try {
      setError(null);
      setConnectionState(ConnectionState.Connecting);

      const device = await manager.requestDevice();
      if (!device) {
        // User cancelled the picker
        setConnectionState(ConnectionState.Disconnected);
        return;
      }

      setConnectionState(ConnectionState.Authenticating);
      const adbInstance = await manager.connect();
      setAdb(adbInstance);

      setConnectionState(ConnectionState.Connected);

      // Fetch device info
      try {
        const info = await manager.getDeviceInfo();
        setDeviceInfo(info);
      } catch {
        // Device info is non-critical, continue without it
        setDeviceInfo({
          model: "Unknown",
          androidVersion: "Unknown",
          serial: "Unknown",
        });
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Connection failed";
      setError(message);
      setConnectionState(ConnectionState.Error);
      setAdb(null);
    }
  }, []);

  const disconnect = useCallback(async () => {
    await managerRef.current.disconnect();
    setAdb(null);
    setDeviceInfo(null);
    setError(null);
    setConnectionState(ConnectionState.Disconnected);
  }, []);

  // Watch for USB disconnection
  useEffect(() => {
    const manager = managerRef.current;
    if (!manager.disconnected) return;

    let cancelled = false;
    manager.disconnected.then(() => {
      if (cancelled) return;
      setAdb(null);
      setDeviceInfo(null);
      setConnectionState(ConnectionState.Disconnected);
    });

    return () => {
      cancelled = true;
    };
  }, [adb]);

  return {
    connectionState,
    setConnectionState,
    adb,
    deviceInfo,
    error,
    setError,
    connect,
    disconnect,
  };
}
