export function mapClientToVideo(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  videoWidth: number,
  videoHeight: number
): { x: number; y: number } {
  const percentageX = Math.max(0, Math.min(1, (clientX - rect.x) / rect.width));
  const percentageY = Math.max(0, Math.min(1, (clientY - rect.y) / rect.height));
  return {
    x: percentageX * videoWidth,
    y: percentageY * videoHeight,
  };
}
