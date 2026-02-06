import { Button } from "../ui/Button.js";
import { ConnectionState } from "../../types/index.js";

interface ConnectionPanelProps {
  state: ConnectionState;
  error: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onRetry: () => void;
  disabled?: boolean;
}

export function ConnectionPanel({
  state,
  error,
  onConnect,
  onDisconnect,
  onRetry,
  disabled,
}: ConnectionPanelProps) {
  const isConnecting =
    state === ConnectionState.Connecting ||
    state === ConnectionState.Authenticating;

  if (state === ConnectionState.Disconnected || state === ConnectionState.Error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-green-600/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-neutral-200">
              Android Screen Controller
            </h2>
            <p className="text-neutral-500 text-sm">
              Mirror and control your Android device from the browser
            </p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <Button
            size="lg"
            onClick={state === ConnectionState.Error ? onRetry : onConnect}
            disabled={disabled}
            className="w-full"
          >
            {state === ConnectionState.Error
              ? "Retry Connection"
              : "Connect USB Device"}
          </Button>

          <div className="text-left space-y-2 text-sm text-neutral-500">
            <p className="font-medium text-neutral-400">Setup instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Enable USB Debugging on your Android device</li>
              <li>Connect your device via USB cable</li>
              <li>Click the button above and select your device</li>
              <li>Tap "Allow" on the USB debugging prompt on your device</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="space-y-4">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-neutral-300">
            {state === ConnectionState.Authenticating
              ? "Check your device and tap \"Allow USB Debugging\""
              : "Connecting to device..."}
          </p>
          <Button variant="ghost" size="sm" onClick={onDisconnect}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
