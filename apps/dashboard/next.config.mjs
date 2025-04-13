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
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  disableLogger: true,
})
