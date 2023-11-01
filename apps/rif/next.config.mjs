/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    "@dotkomonline/env",
    "@dotkomonline/ui"
  ],
  experimental: {
    serverActions: true,
  },
}

export default config
