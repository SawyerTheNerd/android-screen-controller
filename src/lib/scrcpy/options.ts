import { AdbScrcpyOptions2_7 } from "@yume-chan/adb-scrcpy";
import type { ScrcpyConfig } from "../../types/index.js";
import { DEFAULT_SCRCPY_CONFIG } from "../../types/index.js";

export function buildScrcpyOptions(config: ScrcpyConfig = DEFAULT_SCRCPY_CONFIG) {
  return new AdbScrcpyOptions2_7({
    video: true as const,
    audio: true,
    control: true,
    maxSize: config.maxSize,
    videoBitRate: config.bitRate,
    maxFps: config.maxFps,
    tunnelForward: false,
    stayAwake: true,
    powerOn: true,
  });
}
