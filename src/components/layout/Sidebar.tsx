import type { ScrcpyControlMessageWriter } from "@yume-chan/scrcpy";
import { DeviceInfo } from "../connection/DeviceInfo.js";
import { NavigationBar } from "../controls/NavigationBar.js";
import { VolumeControls } from "../controls/VolumeControls.js";
import { PowerButton } from "../controls/PowerButton.js";
import type { DeviceInfo as DeviceInfoType } from "../../types/index.js";

interface SidebarProps {
  deviceInfo: DeviceInfoType | null;
  controller: ScrcpyControlMessageWriter | undefined;
  videoWidth: number;
  videoHeight: number;
  isHardwareAccelerated: boolean;
}

export function Sidebar({
  deviceInfo,
  controller,
  videoWidth,
  videoHeight,
  isHardwareAccelerated,
}: SidebarProps) {
  return (
    <aside className="w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 space-y-5">
        {deviceInfo && <DeviceInfo info={deviceInfo} />}

        <div className="border-t border-neutral-800" />
        <NavigationBar controller={controller} />

        <div className="border-t border-neutral-800" />
        <VolumeControls controller={controller} />

        <div className="border-t border-neutral-800" />
        <PowerButton controller={controller} />

        {videoWidth > 0 && (
          <>
            <div className="border-t border-neutral-800" />
            <div className="space-y-1 text-xs text-neutral-500">
              <p>
                Resolution: {videoWidth}&times;{videoHeight}
              </p>
              <p>
                Decoder: {isHardwareAccelerated ? "WebCodecs (HW)" : "TinyH264 (SW)"}
              </p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
