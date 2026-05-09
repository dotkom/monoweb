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

  // @auth0/nextjs-auth0 v4 intentionally constructs the "crypto" import path at runtime ("cry" + "pto") so bundlers
  // don't bundle Node's crypto. webpack still flags the dynamic import() expression as a "Critical dependency" warning,
  // which is safe to ignore here.
  webpack: (webpackConfig) => {
    webpackConfig.ignoreWarnings = [
      ...(webpackConfig.ignoreWarnings ?? []),
      {
        module: /@auth0[\\/]nextjs-auth0[\\/]dist[\\/]utils[\\/]dpopUtils\.js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ]
    return webpackConfig
  },
}

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
