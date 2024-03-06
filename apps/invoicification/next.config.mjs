/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@dotkomonline/env", "@dotkomonline/ui"],
}

export default config
