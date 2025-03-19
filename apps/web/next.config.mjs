/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
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
  transpilePackages: [
    "@dotkomonline/auth",
    "@dotkomonline/db",
    "@dotkomonline/gateway-edge-nextjs",
    "@dotkomonline/gateway-trpc",
    "@dotkomonline/types",
    "@dotkomonline/ui",
  ],
  output: "standalone",
}

export default config
