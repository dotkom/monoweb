const path = require("path")

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
  async viteFinal(config, { configType }) {
    return {
      ...config,
      resolve: {
        alias: [
          {
            find: "@",
            replacement: path.resolve(__dirname, "../../web/src"),
          },
          {
            find: "@components",
            replacement: path.resolve(__dirname, "../../web/src/components"),
          },
          {
            find: "next/image",
            replacement: path.resolve(__dirname, "./NextImage.jsx"),
          },
        ],
      },
      define: {
        "process.env": {},
      },
    }
  },
}
