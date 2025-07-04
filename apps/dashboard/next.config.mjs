import { withSentryConfig } from "@sentry/nextjs"

/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  output: "standalone",
}

export default withSentryConfig(config, {
  org: "dotkom",
  project: "monoweb-dashboard",
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
