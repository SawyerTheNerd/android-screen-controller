import { ConnectionState } from "../../types/index.js";

interface ViewerOverlayProps {
  state: ConnectionState;
}

export function ViewerOverlay({ state }: ViewerOverlayProps) {
  const message =
    state === ConnectionState.PushingServer
      ? "Pushing server to device..."
      : state === ConnectionState.StartingStream
        ? "Starting screen mirror..."
        : "Loading...";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
      <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      <p className="mt-4 text-neutral-400 text-sm">{message}</p>
    </div>
  );
}
