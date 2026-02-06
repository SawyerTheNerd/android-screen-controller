import type { BrowserCompatibility } from "../../lib/utils/browser-checks.js";

interface BrowserCheckProps {
  compat: BrowserCompatibility;
}

export function BrowserCheck({ compat }: BrowserCheckProps) {
  if (compat.issues.length === 0) return null;

  const isBlocking = !compat.hasWebUSB || !compat.isSecureContext;

  return (
    <div
      className={`px-4 py-3 text-sm ${
        isBlocking
          ? "bg-red-900/50 border-b border-red-800 text-red-200"
          : "bg-yellow-900/50 border-b border-yellow-800 text-yellow-200"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {compat.issues.map((issue, i) => (
          <p key={i}>{issue}</p>
        ))}
      </div>
    </div>
  );
}
