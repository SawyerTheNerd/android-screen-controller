import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@yume-chan/fetch-scrcpy-server": path.resolve(
        __dirname,
        "node_modules/@yume-chan/fetch-scrcpy-server/index.js"
      ),
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
