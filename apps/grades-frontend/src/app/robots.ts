import { env } from "@/env"
import type { MetadataRoute } from "next"

// biome-ignore lint/style/noDefaultExport: Robots file must be a default export
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${env.NEXT_PUBLIC_ORIGIN}/sitemap.xml`,
  }
}
