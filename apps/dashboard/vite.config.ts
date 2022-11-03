import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: "./src/assets",
  server: {
    port: Number(process.env.DASHBOARD_PORT || 3002),
  },
  define: {
    global: {},
  },
})
