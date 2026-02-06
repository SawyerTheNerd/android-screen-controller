import {
  AndroidKeyCode,
  AndroidKeyEventAction,
  AndroidKeyEventMeta,
} from "@yume-chan/scrcpy";
import type {
  ScrcpyControlMessageWriter,
  AndroidKeyCode as AndroidKeyCodeType,
} from "@yume-chan/scrcpy";

interface NavigationBarProps {
  controller: ScrcpyControlMessageWriter | undefined;
}

export function NavigationBar({ controller }: NavigationBarProps) {
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
        Navigation
      </h3>
      <div className="flex gap-2 justify-center">
        <NavButton
          onClick={() => pressKey(AndroidKeyCode.AndroidBack)}
          title="Back"
          disabled={!controller}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </NavButton>
        <NavButton
          onClick={() => pressKey(AndroidKeyCode.AndroidHome)}
          title="Home"
          disabled={!controller}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" strokeWidth={2} />
          </svg>
        </NavButton>
        <NavButton
          onClick={() => pressKey(AndroidKeyCode.AndroidAppSwitch)}
          title="Recents"
          disabled={!controller}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" rx="1" strokeWidth={2} />
          </svg>
        </NavButton>
      </div>
    </div>
  );
}

function NavButton({
  children,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="w-12 h-10 flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
    >
      {children}
    </button>
  );
}
