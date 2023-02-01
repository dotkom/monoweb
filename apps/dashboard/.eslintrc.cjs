const config = require("packages/config/eslint-preset.js")

module.exports = {
  ...config,
  extends: [...config.extends, "next"],
}
