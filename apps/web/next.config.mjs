import { withSentryConfig } from "@sentry/nextjs"

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
  output: "standalone",
}

export default withSentryConfig(config, {
  org: "dotkom",
  project: "monoweb-web",
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  disableLogger: true,
})
