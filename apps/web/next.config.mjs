/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["cdn.sanity.io", "onlineweb4-prod.s3.eu-north-1.amazonaws.com"],
  },
  experimental: {
    appDir: true,
    swcPlugins: [["next-superjson-plugin", {}]]
  },
  transpilePackages: [
    "@dotkomonline/auth",
    "@dotkomonline/db",
    "@dotkomonline/env",
    "@dotkomonline/emails",
    "@dotkomonline/gateway-edge-nextjs",
    "@dotkomonline/gateway-trpc",
    "@dotkomonline/types",
    "@dotkomonline/ui",
  ],
}

export default config
