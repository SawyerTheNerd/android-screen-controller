import { useState, useCallback, useEffect, type RefObject } from "react";

export function useFullscreen(elementRef: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      elementRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, [elementRef]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  return { isFullscreen, toggle };
}
