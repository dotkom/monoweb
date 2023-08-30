import { defineConfig } from "tsup"

export default defineConfig({
  splitting: false,
  bundle: true,
  sourcemap: true,
  clean: true,
  format: "esm",
  target: "node18",
  platform: "node",
  noExternal: [/(.*)/],
})
