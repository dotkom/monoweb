import { withSentryConfig } from "@sentry/nextjs"

/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.eu-north-1.amazonaws.com",
        pathname: "/cdn.online.ntnu.no/**",
      },
      {
        protocol: "https",
        hostname: "**.online.ntnu.no",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
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
