import type { ScrcpyControlMessageWriter } from "@yume-chan/scrcpy";
import { createTouchHandler } from "./touch-handler.js";
import { createKeyboardHandler } from "./keyboard-handler.js";
import { createScrollHandler } from "./scroll-handler.js";

export class InputManager {
  private element: HTMLElement | null = null;
  private touchHandler: ((e: PointerEvent) => void) | null = null;
  private keyHandler: ((e: KeyboardEvent) => void) | null = null;
  private scrollHandler: ((e: WheelEvent) => void) | null = null;
  private controller: ScrcpyControlMessageWriter;
  private getVideoDimensions: () => { width: number; height: number };

  constructor(
    controller: ScrcpyControlMessageWriter,
    getVideoDimensions: () => { width: number; height: number }
  ) {
    this.controller = controller;
    this.getVideoDimensions = getVideoDimensions;
  }

  attach(element: HTMLElement) {
    this.detach();
    this.element = element;

    this.touchHandler = createTouchHandler(
      this.controller,
      this.getVideoDimensions
    );
    this.keyHandler = createKeyboardHandler(this.controller);
    this.scrollHandler = createScrollHandler(
      this.controller,
      this.getVideoDimensions
    );

    element.addEventListener("pointerdown", this.touchHandler);
    element.addEventListener("pointermove", this.touchHandler);
    element.addEventListener("pointerup", this.touchHandler);
    element.addEventListener("pointercancel", this.touchHandler);
    element.addEventListener("wheel", this.scrollHandler, { passive: false });

    // Prevent context menu on right click
    element.addEventListener("contextmenu", this.preventContextMenu);

    // Keyboard events on document so they work even when canvas isn't focused
    document.addEventListener("keydown", this.keyHandler);
    document.addEventListener("keyup", this.keyHandler);

    // Make element focusable for better UX
    element.tabIndex = 0;
    element.style.outline = "none";
    element.focus();
  }

  detach() {
    if (this.element && this.touchHandler) {
      this.element.removeEventListener("pointerdown", this.touchHandler);
      this.element.removeEventListener("pointermove", this.touchHandler);
      this.element.removeEventListener("pointerup", this.touchHandler);
      this.element.removeEventListener("pointercancel", this.touchHandler);
    }
    if (this.element && this.scrollHandler) {
      this.element.removeEventListener("wheel", this.scrollHandler);
    }
    if (this.element) {
      this.element.removeEventListener("contextmenu", this.preventContextMenu);
    }
    if (this.keyHandler) {
      document.removeEventListener("keydown", this.keyHandler);
      document.removeEventListener("keyup", this.keyHandler);
    }

    this.element = null;
    this.touchHandler = null;
    this.keyHandler = null;
    this.scrollHandler = null;
  }

  private preventContextMenu = (e: Event) => {
    e.preventDefault();
  };
}
