import { withSentryConfig } from "@sentry/nextjs"
import createNextIntlPlugin from "next-intl/plugin"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // zod v4 has internal ESM circular imports that webpack cannot linearize safely.
  serverExternalPackages: ["zod"],
  async redirects() {
    return [
      {
        source: "/course",
        destination: "/emner",
        permanent: true,
      },
      {
        source: "/course/",
        destination: "/emner",
        permanent: true,
      },
      {
        source: "/course/:code",
        destination: "/emner/:code",
        permanent: true,
      },
      {
        source: "/course/:code/",
        destination: "/emner/:code",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/",
        permanent: true,
      },
      {
        source: "/login/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/about",
        destination: "/",
        permanent: true,
      },
      {
        source: "/about/",
        destination: "/",
        permanent: true,
      },
    ]
  },
}

const withNextIntl = createNextIntlPlugin()

export default withSentryConfig(withNextIntl(nextConfig), {
  org: "dotkom",
  project: "grades-frontend",
  sentryUrl: "https://sentry.io/",
  tunnelRoute: "/pulse",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  // Turbopack is the default bundler in Next.js 16, so the `webpack` options have no effect.
  // These are the Turbopack equivalents; `treeshake.removeDebugLogging` has no counterpart.
  _experimental: {
    turbopackReactComponentAnnotation: { enabled: true },
    turbopackApplicationKey: "grades-frontend",
  },
})
