import type { ScrcpyControlMessageWriter } from "@yume-chan/scrcpy";
import { getRenderedVideoRect } from "./touch-handler.js";

export function createScrollHandler(
  controller: ScrcpyControlMessageWriter,
  getVideoDimensions: () => { width: number; height: number }
) {
  return function handleWheelEvent(e: WheelEvent) {
    e.preventDefault();

    const target = e.currentTarget as HTMLElement;
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

    controller.injectScroll({
      pointerX: percentageX * videoWidth,
      pointerY: percentageY * videoHeight,
      videoWidth,
      videoHeight,
      scrollX: 0,
      scrollY: -Math.sign(e.deltaY),
      buttons: 0,
    });
  };
}
