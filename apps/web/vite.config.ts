import path from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "next/link": path.resolve(__dirname, "./.ladle/unoptimized-link.tsx"),
      "next/link.js": path.resolve(__dirname, "./.ladle/unoptimized-link.tsx"),
      "next/image": path.resolve(__dirname, "./.ladle/unoptimized-image.tsx"),
    },
  },
  server: {
    open: false,
    port: 61001,
  },
})
