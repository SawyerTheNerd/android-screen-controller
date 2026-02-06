import {
  AndroidKeyEventAction,
  AndroidKeyEventMeta,
  AndroidKeyCode,
} from "@yume-chan/scrcpy";
import type {
  ScrcpyControlMessageWriter,
  AndroidKeyCode as AndroidKeyCodeType,
  AndroidKeyEventMeta as AndroidKeyEventMetaType,
} from "@yume-chan/scrcpy";

const KEY_MAP: Record<string, AndroidKeyCodeType> = {
  KeyA: AndroidKeyCode.KeyA,
  KeyB: AndroidKeyCode.KeyB,
  KeyC: AndroidKeyCode.KeyC,
  KeyD: AndroidKeyCode.KeyD,
  KeyE: AndroidKeyCode.KeyE,
  KeyF: AndroidKeyCode.KeyF,
  KeyG: AndroidKeyCode.KeyG,
  KeyH: AndroidKeyCode.KeyH,
  KeyI: AndroidKeyCode.KeyI,
  KeyJ: AndroidKeyCode.KeyJ,
  KeyK: AndroidKeyCode.KeyK,
  KeyL: AndroidKeyCode.KeyL,
  KeyM: AndroidKeyCode.KeyM,
  KeyN: AndroidKeyCode.KeyN,
  KeyO: AndroidKeyCode.KeyO,
  KeyP: AndroidKeyCode.KeyP,
  KeyQ: AndroidKeyCode.KeyQ,
  KeyR: AndroidKeyCode.KeyR,
  KeyS: AndroidKeyCode.KeyS,
  KeyT: AndroidKeyCode.KeyT,
  KeyU: AndroidKeyCode.KeyU,
  KeyV: AndroidKeyCode.KeyV,
  KeyW: AndroidKeyCode.KeyW,
  KeyX: AndroidKeyCode.KeyX,
  KeyY: AndroidKeyCode.KeyY,
  KeyZ: AndroidKeyCode.KeyZ,
  Digit0: AndroidKeyCode.Digit0,
  Digit1: AndroidKeyCode.Digit1,
  Digit2: AndroidKeyCode.Digit2,
  Digit3: AndroidKeyCode.Digit3,
  Digit4: AndroidKeyCode.Digit4,
  Digit5: AndroidKeyCode.Digit5,
  Digit6: AndroidKeyCode.Digit6,
  Digit7: AndroidKeyCode.Digit7,
  Digit8: AndroidKeyCode.Digit8,
  Digit9: AndroidKeyCode.Digit9,
  Enter: AndroidKeyCode.Enter,
  Backspace: AndroidKeyCode.Backspace,
  Escape: AndroidKeyCode.Escape,
  ArrowUp: AndroidKeyCode.ArrowUp,
  ArrowDown: AndroidKeyCode.ArrowDown,
  ArrowLeft: AndroidKeyCode.ArrowLeft,
  ArrowRight: AndroidKeyCode.ArrowRight,
  Space: AndroidKeyCode.Space,
  Tab: AndroidKeyCode.Tab,
  Delete: AndroidKeyCode.Delete,
  Home: AndroidKeyCode.Home,
  End: AndroidKeyCode.End,
  PageUp: AndroidKeyCode.PageUp,
  PageDown: AndroidKeyCode.PageDown,
  Comma: AndroidKeyCode.Comma,
  Period: AndroidKeyCode.Period,
  Minus: AndroidKeyCode.Minus,
  Equal: AndroidKeyCode.Equal,
  BracketLeft: AndroidKeyCode.BracketLeft,
  BracketRight: AndroidKeyCode.BracketRight,
  Backslash: AndroidKeyCode.Backslash,
  Semicolon: AndroidKeyCode.Semicolon,
  Quote: AndroidKeyCode.Quote,
  Backquote: AndroidKeyCode.Backquote,
  Slash: AndroidKeyCode.Slash,
  CapsLock: AndroidKeyCode.CapsLock,
  F1: AndroidKeyCode.F1,
  F2: AndroidKeyCode.F2,
  F3: AndroidKeyCode.F3,
  F4: AndroidKeyCode.F4,
  F5: AndroidKeyCode.F5,
  F6: AndroidKeyCode.F6,
  F7: AndroidKeyCode.F7,
  F8: AndroidKeyCode.F8,
  F9: AndroidKeyCode.F9,
  F10: AndroidKeyCode.F10,
  F11: AndroidKeyCode.F11,
  F12: AndroidKeyCode.F12,
  Insert: AndroidKeyCode.Insert,
  Numpad0: AndroidKeyCode.Numpad0,
  Numpad1: AndroidKeyCode.Numpad1,
  Numpad2: AndroidKeyCode.Numpad2,
  Numpad3: AndroidKeyCode.Numpad3,
  Numpad4: AndroidKeyCode.Numpad4,
  Numpad5: AndroidKeyCode.Numpad5,
  Numpad6: AndroidKeyCode.Numpad6,
  Numpad7: AndroidKeyCode.Numpad7,
  Numpad8: AndroidKeyCode.Numpad8,
  Numpad9: AndroidKeyCode.Numpad9,
  NumpadMultiply: AndroidKeyCode.NumpadMultiply,
  NumpadAdd: AndroidKeyCode.NumpadAdd,
  NumpadSubtract: AndroidKeyCode.NumpadSubtract,
  NumpadDecimal: AndroidKeyCode.NumpadDecimal,
  NumpadDivide: AndroidKeyCode.NumpadDivide,
  NumpadEnter: AndroidKeyCode.NumpadEnter,
};

// Browser shortcuts that should not be intercepted
const BROWSER_SHORTCUTS = new Set([
  "KeyT",
  "KeyW",
  "KeyN",
  "KeyL",
  "KeyR",
  "KeyP",
  "KeyJ",
  "KeyH",
  "KeyD",
  "KeyU",
  "KeyG",
  "KeyF",
]);

function getMetaState(e: KeyboardEvent): AndroidKeyEventMetaType {
  let meta: number = AndroidKeyEventMeta.None;
  if (e.shiftKey) meta |= AndroidKeyEventMeta.Shift;
  if (e.ctrlKey) meta |= AndroidKeyEventMeta.Ctrl;
  if (e.altKey) meta |= AndroidKeyEventMeta.Alt;
  if (e.metaKey) meta |= AndroidKeyEventMeta.Meta;
  return meta as AndroidKeyEventMetaType;
}

export function createKeyboardHandler(controller: ScrcpyControlMessageWriter) {
  return function handleKeyEvent(e: KeyboardEvent) {
    // Don't capture browser shortcuts
    if ((e.ctrlKey || e.metaKey) && BROWSER_SHORTCUTS.has(e.code)) {
      return;
    }

    const keyCode = KEY_MAP[e.code];
    if (keyCode === undefined) {
      // For unmapped keys, try to inject as text for keydown events
      if (e.type === "keydown" && e.key.length === 1) {
        controller.injectText(e.key);
        e.preventDefault();
      }
      return;
    }

    e.preventDefault();

    const action =
      e.type === "keydown"
        ? AndroidKeyEventAction.Down
        : AndroidKeyEventAction.Up;

    controller.injectKeyCode({
      action,
      keyCode,
      repeat: e.repeat ? 1 : 0,
      metaState: getMetaState(e),
    });
  };
}
