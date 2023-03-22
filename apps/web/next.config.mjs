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
    appDir: true,
    swcPlugins: [["next-superjson-plugin", {}]],
  },
  transpilePackages: ["@dotkomonline/ui", "@dotkomonline/types", "@dotkomonline/api"],
  eslint: {
    ignoreDuringBuilds: !!process.env.CI,
  },
}

export default config
