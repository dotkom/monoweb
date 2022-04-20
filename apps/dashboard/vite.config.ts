import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: "./src/assets",
  server: {
    port: Number(process.env.VITE_PORT || 3002),
  },
  define: {
    global: {},
  },
})
