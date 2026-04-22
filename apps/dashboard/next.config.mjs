import { withSentryConfig } from "@sentry/nextjs"

/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_LOGIN_ROUTE: "/api/auth/authorize",
    NEXT_PUBLIC_PROFILE_ROUTE: "/api/auth/session",
    NEXT_PUBLIC_ACCESS_TOKEN_ROUTE: "/api/auth/access-token",
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/arrangementer",
        permanent: false,
      },
    ]
  },

  // This is to help with version mismatches for `import-in-the-middle` and `require-in-the-middle` in OTEL packages
  transpilePackages: [
    "import-in-the-middle",
    "require-in-the-middle",
    "@opentelemetry/instrumentation",
    "@sentry/node",
    "@sentry/node-core",
  ],
  // Explicitly ensure the transpiled packages are not treated as external
  serverExternalPackages: [],
}

// Temp test

export default withSentryConfig(config, {
  org: "dotkom",
  project: "monoweb-dashboard",
  sentryUrl: "https://sentry.io/",
  tunnelRoute: "/pulse",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  webpack: {
    reactComponentAnnotation: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
})
