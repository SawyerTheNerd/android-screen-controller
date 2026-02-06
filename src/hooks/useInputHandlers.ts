import { useEffect, useRef } from "react";
import type { ScrcpyControlMessageWriter } from "@yume-chan/scrcpy";
import { InputManager } from "../lib/input/input-manager.js";

export function useInputHandlers(
  controller: ScrcpyControlMessageWriter | undefined,
  getCanvas: () => HTMLCanvasElement | null,
  getVideoDimensions: () => { width: number; height: number }
) {
  const managerRef = useRef<InputManager | null>(null);

  useEffect(() => {
    if (!controller) {
      managerRef.current?.detach();
      managerRef.current = null;
      return;
    }

    const canvas = getCanvas();
    if (!canvas) return;

    const manager = new InputManager(controller, getVideoDimensions);
    manager.attach(canvas);
    managerRef.current = manager;

    return () => {
      manager.detach();
      managerRef.current = null;
    };
  }, [controller, getCanvas, getVideoDimensions]);
}
