import { defineConfig } from "vitest/config"

const defaultExclude = [
  "**/node_modules/**",
  "**/dist/**",
  "**/cypress/**",
  "**/.{idea,git,cache,output,temp}/**",
  "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
  "**/payment-service.spec.ts",
]

export default defineConfig({
  test: {
    exclude: defaultExclude.concat("**/.e2e-spec.ts"),
    globals: true,
    environment: "node",
    coverage: {
      reporter: ["lcov"],
    },
  },
})
