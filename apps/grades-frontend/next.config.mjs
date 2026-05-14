import createNextIntlPlugin from "next-intl/plugin"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // zod v4 has internal ESM circular imports that webpack cannot linearize safely.
  serverExternalPackages: ["zod"],
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
