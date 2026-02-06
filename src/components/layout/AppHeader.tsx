import { StatusIndicator } from "../ui/StatusIndicator.js";
import { Button } from "../ui/Button.js";
import { ConnectionState } from "../../types/index.js";

interface AppHeaderProps {
  state: ConnectionState;
  deviceName?: string;
  onDisconnect: () => void;
}

export function AppHeader({ state, deviceName, onDisconnect }: AppHeaderProps) {
  const showDisconnect =
    state !== ConnectionState.Disconnected &&
    state !== ConnectionState.Connecting;

  return (
    <header className="h-12 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span className="font-semibold text-neutral-200 text-sm">
            Screen Controller
          </span>
        </div>
        {deviceName && (
          <span className="text-neutral-500 text-sm hidden sm:inline">
            {deviceName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <StatusIndicator state={state} />
        {showDisconnect && (
          <Button variant="ghost" size="sm" onClick={onDisconnect}>
            Disconnect
          </Button>
        )}
      </div>
    </header>
  );
}
