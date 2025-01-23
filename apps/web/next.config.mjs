/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        hostname: "**",
        protocol: "https",
        pathname: "**",
        port: "",
      },
    ],
  },
  experimental: {
    swcPlugins: [["next-superjson-plugin", {}]],
  },
  transpilePackages: [
    "@dotkomonline/auth",
    "@dotkomonline/db",
    "@dotkomonline/env",
    "@dotkomonline/gateway-edge-nextjs",
    "@dotkomonline/gateway-trpc",
    "@dotkomonline/types",
    "@dotkomonline/ui",
  ],
}

export default config
