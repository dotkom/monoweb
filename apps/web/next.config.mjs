/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        hostname: "cdn.sanity.io",
        protocol: "https",
        pathname: "**",
        port: "",
      },
      {
        hostname: "onlineweb4-prod.s3.eu-north-1.amazonaws.com",
        protocol: "https",
        pathname: "**",
        port: "",
      },
      {
        hostname: "online.ntnu.no",
        protocol: "https",
        pathname: "**",
        port: "",
      },
      {
        hostname: "s3.eu-north-1.amazonaws.com",
        protocol: "https",
        pathname: "**",
        port: "",
      },
      {
        hostname: "via.placeholder.com",
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
    "@dotkomonline/gateway-edge-nextjs",
    "@dotkomonline/gateway-trpc",
    "@dotkomonline/types",
    "@dotkomonline/ui",
  ],
}

export default config
