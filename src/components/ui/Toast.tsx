import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "info" | "error" | "success";
  onDismiss: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "info",
  onDismiss,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  const typeStyles = {
    info: "bg-neutral-800 border-neutral-600",
    error: "bg-red-900/80 border-red-700",
    success: "bg-green-900/80 border-green-700",
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-lg text-sm text-neutral-200 max-w-sm ${typeStyles[type]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        <button
          onClick={onDismiss}
          className="text-neutral-500 hover:text-neutral-300 shrink-0 cursor-pointer"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
