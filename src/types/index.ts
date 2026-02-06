export const ConnectionState = {
  Disconnected: "disconnected",
  Connecting: "connecting",
  Authenticating: "authenticating",
  Connected: "connected",
  PushingServer: "pushing_server",
  StartingStream: "starting_stream",
  Streaming: "streaming",
  Error: "error",
} as const;

export type ConnectionState =
  (typeof ConnectionState)[keyof typeof ConnectionState];

export interface DeviceInfo {
  model: string;
  androidVersion: string;
  serial: string;
  screenSize?: string;
}

export interface ScrcpyConfig {
  maxSize: number;
  bitRate: number;
  maxFps: number;
}

export const DEFAULT_SCRCPY_CONFIG: ScrcpyConfig = {
  maxSize: 1080,
  bitRate: 4_000_000,
  maxFps: 30,
};
