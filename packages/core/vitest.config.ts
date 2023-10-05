import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            reporter: ["lcov"],
        },
        environment: "node",
        globals: true,
    },
});
