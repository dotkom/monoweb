/** @type {import("@storybook/core-common").StorybookConfig} */
module.exports = {
  stories: ["../../../packages/ow-ui/src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-postcss",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  features: {
    storyStoreV7: true,
  },
  async viteFinal(config, { configType }) {
    return {
      ...config,
      define: {
        "process.env": {},
      },
    }
  },
  docs: {
    autodocs: true,
  },
}
