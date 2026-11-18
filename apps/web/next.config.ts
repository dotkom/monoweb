import type { NextConfig } from "next"

const config: NextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  env: {
    NEXT_PUBLIC_LOGIN_ROUTE: "/api/auth/authorize",
    NEXT_PUBLIC_PROFILE_ROUTE: "/api/auth/session",
    NEXT_PUBLIC_ACCESS_TOKEN_ROUTE: "/api/auth/access-token",
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/arrangementer",
        permanent: false,
      },
      {
        source: "/wiki/:path*",
        destination: "https://wiki.online.ntnu.no/:path*",
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/api/calendar/all.ics",
        destination: "/api/calendar/all",
      },
      {
        source: "/api/calendar/u/:token/calendar.ics",
        destination: "/api/calendar/u/:token",
      },
    ]
  },

  // This is to help with version mismatches for `import-in-the-middle` and `require-in-the-middle` in OTEL packages
  transpilePackages: ["import-in-the-middle", "require-in-the-middle", "@opentelemetry/instrumentation"],

  // Explicitly ensure the transpiled packages are not treated as external.
  // zod must be external because zod v4 has internal ESM circular imports that bundlers cannot linearize safely.
  serverExternalPackages: ["zod"],
}

export default config
