export default {
  preset: "ts-jest/presets/default-esm",
  verbose: true,
  testEnvironment: "node",
  clearMocks: true,
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
}
