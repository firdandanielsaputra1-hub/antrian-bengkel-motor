
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: "127.0.0.1",
    port: 5173,

    allowedHosts: [
      "bengkelmotor.tail0acfd6.ts.net",
      "desktop-l6virv7.tail0acfd6.ts.net",
    ],

    proxy: {
      "/api": {
        target: "http://localhost",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api/, "/bengkel-api"),
      },
    },
  },
});
