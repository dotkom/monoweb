import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  server: {
    port: 3002,
    strictPort: true,
  },
  build: {
    outDir: "build",
  },
  optimizeDeps: {
    include: ["lodash"],
  },
  plugins: [react()],
})
