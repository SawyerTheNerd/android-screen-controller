import { useMemo } from "react";
import { checkBrowserCompatibility, type BrowserCompatibility } from "../lib/utils/browser-checks.js";

export function useBrowserCompat(): BrowserCompatibility {
  return useMemo(() => checkBrowserCompatibility(), []);
}
