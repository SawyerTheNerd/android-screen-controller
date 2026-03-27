import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const fetchScrcpyServerPath = fileURLToPath(
  import.meta.resolve("@yume-chan/fetch-scrcpy-server")
);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    allowedHosts: ["asc.enzonic.me"],
  },
  resolve: {
    alias: {
      "@yume-chan/fetch-scrcpy-server": fetchScrcpyServerPath,
    },
  },
  optimizeDeps: {
    exclude: [
      "@yume-chan/fetch-scrcpy-server",
      "@yume-chan/scrcpy-decoder-tinyh264",
    ],
    include: [
      "@yume-chan/scrcpy-decoder-tinyh264 > yuv-buffer",
      "@yume-chan/scrcpy-decoder-tinyh264 > yuv-canvas",
    ],
  },
});
