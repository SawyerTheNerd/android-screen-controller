import {
  AndroidKeyCode,
  AndroidKeyEventAction,
  AndroidKeyEventMeta,
} from "@yume-chan/scrcpy";
import type {
  ScrcpyControlMessageWriter,
  AndroidKeyCode as AndroidKeyCodeType,
} from "@yume-chan/scrcpy";

interface VolumeControlsProps {
  controller: ScrcpyControlMessageWriter | undefined;
}

export function VolumeControls({ controller }: VolumeControlsProps) {
  const pressKey = async (keyCode: AndroidKeyCodeType) => {
    if (!controller) return;
    await controller.injectKeyCode({
      action: AndroidKeyEventAction.Down,
      keyCode,
      repeat: 0,
      metaState: AndroidKeyEventMeta.None,
    });
    await controller.injectKeyCode({
      action: AndroidKeyEventAction.Up,
      keyCode,
      repeat: 0,
      metaState: AndroidKeyEventMeta.None,
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-neutral-400 uppercase text-xs font-semibold tracking-wider">
        Volume
      </h3>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => pressKey(AndroidKeyCode.VolumeUp)}
          disabled={!controller}
          title="Volume Up"
          className="flex-1 h-9 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-40 disabled:pointer-events-none text-sm cursor-pointer"
        >
          Vol +
        </button>
        <button
          onClick={() => pressKey(AndroidKeyCode.VolumeDown)}
          disabled={!controller}
          title="Volume Down"
          className="flex-1 h-9 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-40 disabled:pointer-events-none text-sm cursor-pointer"
        >
          Vol -
        </button>
      </div>
    </div>
  );
}
