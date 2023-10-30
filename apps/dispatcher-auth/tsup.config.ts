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
  banner: {
    js: "import { createRequire as __DONT_USE_O } from 'module'; const require = __DONT_USE_O(import.meta.url);",
  },
})
