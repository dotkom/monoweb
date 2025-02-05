/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  images: {
    domains: ["cdn.sanity.io"],
  },
  transpilePackages: ["@dotkomonline/auth", "@dotkomonline/gateway-trpc", "@dotkomonline/types", "@dotkomonline/ui"],
  output: "standalone",
}

export default config
