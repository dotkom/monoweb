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
  },
  transpilePackages: [
      "@dotkomonline/auth",
    "@dotkomonline/env",
    "@dotkomonline/gateway-trpc",
    "@dotkomonline/types",
    "@dotkomonline/ui"
  ],
}

export default config
