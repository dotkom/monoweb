/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@dotkomonline/ui"],
  output: "standalone",
}

export default config
