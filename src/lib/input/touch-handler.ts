import {
  AndroidMotionEventAction,
  AndroidMotionEventButton,
} from "@yume-chan/scrcpy";
import type { ScrcpyControlMessageWriter } from "@yume-chan/scrcpy";

const BUTTON_MAP: Record<number, number> = {
  0: AndroidMotionEventButton.Primary,
  1: AndroidMotionEventButton.Tertiary,
  2: AndroidMotionEventButton.Secondary,
  3: AndroidMotionEventButton.Back,
  4: AndroidMotionEventButton.Forward,
};

/**
 * Calculate the actual rendered area of a canvas using object-fit: contain.
 * The rendered video may be letterboxed (bars on top/bottom) or pillarboxed
 * (bars on left/right), so we need the real content area for accurate
 * coordinate mapping.
 */
export function getRenderedVideoRect(
  element: HTMLElement,
  videoWidth: number,
  videoHeight: number
): { x: number; y: number; width: number; height: number } {
  const rect = element.getBoundingClientRect();

  if (videoWidth === 0 || videoHeight === 0) {
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }

  const elementAspect = rect.width / rect.height;
  const videoAspect = videoWidth / videoHeight;

  let renderWidth: number;
  let renderHeight: number;

  if (videoAspect > elementAspect) {
    // Video is wider than element — pillarboxed (bars on top/bottom)
    renderWidth = rect.width;
    renderHeight = rect.width / videoAspect;
  } else {
    // Video is taller than element — letterboxed (bars on left/right)
    renderHeight = rect.height;
    renderWidth = rect.height * videoAspect;
  }

  const offsetX = (rect.width - renderWidth) / 2;
  const offsetY = (rect.height - renderHeight) / 2;

  return {
    x: rect.x + offsetX,
    y: rect.y + offsetY,
    width: renderWidth,
    height: renderHeight,
  };
}

export function createTouchHandler(
  controller: ScrcpyControlMessageWriter,
  getVideoDimensions: () => { width: number; height: number }
) {
  return function handlePointerEvent(e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    let action: typeof AndroidMotionEventAction[keyof typeof AndroidMotionEventAction];
    switch (e.type) {
      case "pointerdown":
        action = AndroidMotionEventAction.Down;
        break;
      case "pointermove":
        action =
          e.buttons === 0
            ? AndroidMotionEventAction.HoverMove
            : AndroidMotionEventAction.Move;
        break;
      case "pointerup":
        action = AndroidMotionEventAction.Up;
        break;
      case "pointercancel":
        action = AndroidMotionEventAction.Cancel;
        break;
      default:
        return;
    }

    const { width: videoWidth, height: videoHeight } = getVideoDimensions();

    // Calculate the actual rendered video area accounting for object-fit: contain
    const rendered = getRenderedVideoRect(target, videoWidth, videoHeight);

    const percentageX = Math.max(
      0,
      Math.min(1, (e.clientX - rendered.x) / rendered.width)
    );
    const percentageY = Math.max(
      0,
      Math.min(1, (e.clientY - rendered.y) / rendered.height)
    );

    controller.injectTouch({
      action,
      pointerId: BigInt(e.pointerId),
      pointerX: percentageX * videoWidth,
      pointerY: percentageY * videoHeight,
      videoWidth,
      videoHeight,
      pressure: e.buttons === 0 ? 0 : 1,
      actionButton: BUTTON_MAP[e.button] ?? AndroidMotionEventButton.Primary,
      buttons: e.buttons,
    });
  };
}
