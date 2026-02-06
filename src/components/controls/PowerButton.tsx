import {
  AndroidKeyCode,
  AndroidKeyEventAction,
  AndroidKeyEventMeta,
} from "@yume-chan/scrcpy";
import type { ScrcpyControlMessageWriter } from "@yume-chan/scrcpy";

interface PowerButtonProps {
  controller: ScrcpyControlMessageWriter | undefined;
}

export function PowerButton({ controller }: PowerButtonProps) {
  const pressPower = async () => {
    if (!controller) return;
    await controller.injectKeyCode({
      action: AndroidKeyEventAction.Down,
      keyCode: AndroidKeyCode.Power,
      repeat: 0,
      metaState: AndroidKeyEventMeta.None,
    });
    await controller.injectKeyCode({
      action: AndroidKeyEventAction.Up,
      keyCode: AndroidKeyCode.Power,
      repeat: 0,
      metaState: AndroidKeyEventMeta.None,
    });
  };

  return (
    <div className="space-y-2">
      <h3 className="text-neutral-400 uppercase text-xs font-semibold tracking-wider">
        Power
      </h3>
      <button
        onClick={pressPower}
        disabled={!controller}
        title="Power"
        className="w-full h-9 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-40 disabled:pointer-events-none text-sm gap-2 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
        </svg>
        Power
      </button>
    </div>
  );
}
