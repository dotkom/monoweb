/* eslint-disable */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"))

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
    transpilePackages: ["@dotkomonline/ui", "@dotkomonline/auth", "@dotkomonline/types", "@dotkomonline/api"],
  },
  eslint: {
    ignoreDuringBuilds: !!process.env.CI,
  },
}

export default config
