import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const port = process.env.VITE_PORT
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: "./src/assets",
  server: {
    port: port ? parseInt(port) : 3002,
  },
  define: {
    global: {},
  },
})
