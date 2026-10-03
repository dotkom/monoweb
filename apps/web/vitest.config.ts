import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@dashboard/app": fileURLToPath(new URL("./src/app/(admin)/admin", import.meta.url)),
      "@dashboard": fileURLToPath(new URL("./src/dashboard", import.meta.url)),
      "@/app": fileURLToPath(new URL("./src/app/(web)", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
})
