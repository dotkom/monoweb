import { withSentryConfig } from "@sentry/nextjs"

/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      new URL("https://s3.eu-north-1.amazonaws.com/cdn.online.ntnu.no/**"),
      new URL("https://placehold.co/**"), // For placeholder images used for events

      new URL("https://online.ntnu.no/**"),
      new URL("https://cdn.online.ntnu.no/**"),
      new URL("https://wiki.online.ntnu.no/**"),
      new URL("https://web.online.ntnu.no/**"),
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
