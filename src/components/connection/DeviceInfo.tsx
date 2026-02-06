import type { DeviceInfo as DeviceInfoType } from "../../types/index.js";

interface DeviceInfoProps {
  info: DeviceInfoType;
}

export function DeviceInfo({ info }: DeviceInfoProps) {
  return (
    <div className="space-y-2 text-sm">
      <h3 className="text-neutral-400 uppercase text-xs font-semibold tracking-wider">
        Device
      </h3>
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-neutral-500">Model</span>
          <span className="text-neutral-200">{info.model}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Android</span>
          <span className="text-neutral-200">{info.androidVersion}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">Serial</span>
          <span className="text-neutral-200 font-mono text-xs">
            {info.serial.length > 12
              ? info.serial.slice(0, 12) + "..."
              : info.serial}
          </span>
        </div>
      </div>
    </div>
  );
}
