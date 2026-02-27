import { withSentryConfig } from "@sentry/nextjs"

/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/wiki/:path*",
        destination: "https://wiki.online.ntnu.no/:path*",
        permanent: true,
      },
    ]
  },
}

export default withSentryConfig(config, {
  org: "dotkom",
  project: "monoweb-web",
  sentryUrl: "https://sentry.io/",
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: "/pulse",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
})
