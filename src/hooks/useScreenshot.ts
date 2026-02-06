import { useCallback } from "react";

export function useScreenshot(getCanvas: () => HTMLCanvasElement | null) {
  const takeScreenshot = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `screenshot-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [getCanvas]);

  return { takeScreenshot };
}
