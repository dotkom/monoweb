export const revalidate = 86400 // 24 hours

import { env } from "@/env"
import { server } from "@/utils/trpc/server"
import { createAbsoluteCoursePageUrl } from "@dotkomonline/utils"
import type { MetadataRoute } from "next"

// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap#generating-a-sitemap-using-code-js-ts

// biome-ignore lint/style/noDefaultExport: Sitemap must be a default export
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courseSitemapEntries = await server.course.findManySitemapEntries.query()

  const coursesSitemap: MetadataRoute.Sitemap = courseSitemapEntries.map((courseSitemapEntry) => ({
    url: createAbsoluteCoursePageUrl(env.NEXT_PUBLIC_ORIGIN, courseSitemapEntry.code),
    lastModified: courseSitemapEntry.updatedAt,
  }))

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: `${env.NEXT_PUBLIC_ORIGIN}/`,
    },
    {
      url: `${env.NEXT_PUBLIC_ORIGIN}/emner`,
    },
    ...coursesSitemap,
  ]

  return sitemap
}
