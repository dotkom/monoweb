import { defineConfig } from "vitest/config"

const defaultExclude = [
  "**/node_modules/**",
  "**/dist/**",
  "**/cypress/**",
  "**/.{idea,git,cache,output,temp}/**",
  "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
]

export default defineConfig({
  test: {
    exclude: defaultExclude.concat("**/*.spec.ts"),
    include: ["**/*.e2e-spec.ts"],
    mockReset: true,
    setupFiles: ["./vitest-integration.setup.ts"],
  },
})
