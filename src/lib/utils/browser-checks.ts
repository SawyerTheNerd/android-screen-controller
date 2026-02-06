export interface BrowserCompatibility {
  hasWebUSB: boolean;
  hasWebCodecs: boolean;
  isSecureContext: boolean;
  issues: string[];
}

export function checkBrowserCompatibility(): BrowserCompatibility {
  const hasWebUSB = "usb" in navigator;
  const hasWebCodecs = "VideoDecoder" in globalThis;
  const isSecureContext = globalThis.isSecureContext;
  const issues: string[] = [];

  if (!isSecureContext) {
    issues.push(
      "This page must be served over HTTPS or localhost for WebUSB to work."
    );
  }
  if (!hasWebUSB) {
    issues.push(
      "WebUSB is not supported in your browser. Please use Chrome or Edge."
    );
  }
  if (!hasWebCodecs) {
    issues.push(
      "WebCodecs not available — software video decoding will be used (slower)."
    );
  }

  return { hasWebUSB, hasWebCodecs, isSecureContext, issues };
}
