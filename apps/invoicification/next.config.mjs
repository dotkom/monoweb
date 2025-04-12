import { withSentryConfig } from "@sentry/nextjs"
/**
 * @type {import('next').NextConfig}
 */
const config = {
  reactStrictMode: true,
  transpilePackages: ["@dotkomonline/ui"],
  output: "standalone",
}

export default withSentryConfig(config, {
  org: "dotkom",
  project: "monoweb-invoicification",
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  disableLogger: true,
})
