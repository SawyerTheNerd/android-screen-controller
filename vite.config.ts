import { fileURLToPath } from "url";
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5174,
    allowedHosts: ["asc.enzonic.me"],
  },
  resolve: {
    alias: {
      "@yume-chan/fetch-scrcpy-server": path.join(
        __dirname,
        "node_modules",
        "@yume-chan",
        "fetch-scrcpy-server",
        "index.js"
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
