const tsconfigPaths = require("vite-tsconfig-paths")
console.log(tsconfigPaths.default())

/** @type {import("@storybook/core-common").StorybookConfig} */
module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "storybook-dark-mode",
    "@storybook/addon-postcss",
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-vite",
  },
  features: {
    storyStoreV7: true,
  },
  async viteFinal(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      plugins: [...config.plugins, tsconfigPaths.default()],
    }
    return config
  },
}
