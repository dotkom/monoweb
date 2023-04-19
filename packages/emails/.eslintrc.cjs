const config = require("@dotkomonline/config/eslint-preset")

module.exports = {
  ...config,
  extends: [...config.extends, "next"],
}
