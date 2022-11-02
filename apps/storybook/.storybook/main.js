const path = require("path")
const tsconfigPaths = require("vite-tsconfig-paths").default

/** @type {import("@storybook/core-common").StorybookConfig} */
module.exports = {
  stories: ["../../../packages/ow-ui/src/**/*.stories.@(js|jsx|ts|tsx)", "../../web/src/**/*.stories.@(js|jsx|ts|tsx)"],
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
  // @param {import("vite").UserConfig} config
  async viteFinal(config) {
    config.plugins.push(
      tsconfigPaths({
        projects: [path.resolve(path.dirname(__dirname), "../web", "tsconfig.json")],
      })
    )

    return config
  },
}
