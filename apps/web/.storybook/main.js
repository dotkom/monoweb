const path = require("path");
const resolve = (p) => path.join(process.cwd(), p);

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-controls",
    "@storybook/addon-knobs",
  ],
  webpackFinal(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@theme": resolve("src/theme/stitches.config.ts"),
      "@components": resolve("src/components"),
    };
    return config;
  },
};
