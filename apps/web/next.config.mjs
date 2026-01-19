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
