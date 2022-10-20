/* eslint-disable */
const withTM = require("next-transpile-modules")(["@dotkomonline/ui"])

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  swcMinify: true,
  images: {
    domains: ["cdn.sanity.io"],
  },
}

module.exports = withTM(nextConfig)
