import { withSentryConfig } from "@sentry/nextjs"

/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/arrangementer",
        permanent: false,
      },
    ]
  },

  // This is supposed to help with version mismatches for `import-in-the-middle` and `require-in-the-middle` in OTEL
  // packages and Sentry
  transpilePackages: [
    "import-in-the-middle",
    "require-in-the-middle",
    "@opentelemetry/instrumentation",
    "@sentry/node", // Add Sentry here so it uses the bundled version
  ],
  // Explicitly ensure the transpiled packages are NOT treated as external
  serverExternalPackages: [],
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
