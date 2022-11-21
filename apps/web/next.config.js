/* eslint-disable */
const withTM = require("next-transpile-modules")(["@dotkomonline/ui", "@dotkomonline/auth"])

/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["cdn.sanity.io"],
  },
  experimental: {
    transpilePackages: ["@dotkomonline/ui", "@dotkomonline/auth"],
  },
  eslint: {
    ignoreDuringBuilds: !!process.env.CI,
  },
}

module.exports = withTM(config)
