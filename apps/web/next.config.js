/* eslint-disable */
const withPlugins = require("next-compose-plugins")
const transpileModules = require("next-transpile-modules")(["@ow/ui"]);

/**
 * @type {import('next').NextConfig}
 */
const config = {
  swcMinify: true,
  images: {
    domains: ["cdn.sanity.io"],
  },
}

module.exports = withPlugins([transpileModules], config)
