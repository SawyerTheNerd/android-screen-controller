import { ConnectionState } from "../../types/index.js";

interface StatusIndicatorProps {
  state: ConnectionState;
}

const stateColors: Record<ConnectionState, string> = {
  [ConnectionState.Disconnected]: "bg-neutral-500",
  [ConnectionState.Connecting]: "bg-yellow-500 animate-pulse",
  [ConnectionState.Authenticating]: "bg-yellow-500 animate-pulse",
  [ConnectionState.Connected]: "bg-blue-500",
  [ConnectionState.PushingServer]: "bg-blue-500 animate-pulse",
  [ConnectionState.StartingStream]: "bg-blue-500 animate-pulse",
  [ConnectionState.Streaming]: "bg-green-500",
  [ConnectionState.Error]: "bg-red-500",
};

const stateLabels: Record<ConnectionState, string> = {
  [ConnectionState.Disconnected]: "Disconnected",
  [ConnectionState.Connecting]: "Connecting...",
  [ConnectionState.Authenticating]: "Authorizing...",
  [ConnectionState.Connected]: "Connected",
  [ConnectionState.PushingServer]: "Preparing...",
  [ConnectionState.StartingStream]: "Starting...",
  [ConnectionState.Streaming]: "Streaming",
  [ConnectionState.Error]: "Error",
};

export function StatusIndicator({ state }: StatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${stateColors[state]}`} />
      <span className="text-sm text-neutral-400">{stateLabels[state]}</span>
    </div>
  );
}
