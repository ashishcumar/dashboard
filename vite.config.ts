import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/dashboard/",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "react-vendor";
            }
            if (id.includes("jotai")) {
              return "jotai-vendor";
            }
            if (id.includes("react-icons")) {
              return "icons-vendor";
            }
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    minify: "esbuild",
    cssMinify: true,
    cssCodeSplit: false,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "jotai"],
    exclude: [],
  },
  server: {
    headers: {
      "Cache-Control": "public, max-age=31536000",
    },
  },
});
