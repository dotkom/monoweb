/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    coverage: {
      reporter: ["lcov"],
    },
    setupFiles: "vitest.setup.ts",
  },
})
