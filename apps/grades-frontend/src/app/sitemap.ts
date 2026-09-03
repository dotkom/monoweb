export const revalidate = 86400 // 24 hours

import { env } from "@/env"
import { getPathname } from "@/i18n/navigation"
import { server } from "@/utils/trpc/server"
import { toAbsoluteUrl } from "@dotkomonline/utils"
import type { MetadataRoute } from "next"

// https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap#generating-a-sitemap-using-code-js-ts

// biome-ignore lint/style/noDefaultExport: Sitemap must be a default export
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courseSitemapEntries = await server.course.findManySitemapEntries.query()

  const coursesSitemap: MetadataRoute.Sitemap = courseSitemapEntries.map((courseSitemapEntry) => {
    const encodedCode = encodeURIComponent(courseSitemapEntry.code)

    const noPath = getPathname({ href: `/emner/${encodedCode}`, locale: "no" })
    const enPath = getPathname({ href: `/emner/${encodedCode}`, locale: "en" })
    const noUrl = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, noPath)
    const enUrl = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, enPath)

    const includeEn = courseSitemapEntry.nameEn !== null

    return {
      url: noUrl,
      lastModified: courseSitemapEntry.updatedAt,
      ...(includeEn && {
        alternates: {
          languages: {
            no: noUrl,
            en: enUrl,
            "x-default": noUrl,
          },
        },
      }),
    }
  })

  const rootNoPath = getPathname({ href: `/`, locale: "no" })
  const rootEnPath = getPathname({ href: `/`, locale: "en" })
  const rootNoUrl = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, rootNoPath)
  const rootEnUrl = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, rootEnPath)

  const coursesNoPath = getPathname({ href: `/emner`, locale: "no" })
  const coursesEnPath = getPathname({ href: `/emner`, locale: "en" })
  const coursesNoUrl = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, coursesNoPath)
  const coursesEnUrl = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, coursesEnPath)

  const sitemap: MetadataRoute.Sitemap = [
    {
      url: rootNoUrl,
      alternates: {
        languages: {
          no: rootNoUrl,
          en: rootEnUrl,
          "x-default": rootNoUrl,
        },
      },
    },
    {
      url: coursesNoUrl,
      alternates: {
        languages: {
          no: coursesNoUrl,
          en: coursesEnUrl,
          "x-default": coursesNoUrl,
        },
      },
    },
    ...coursesSitemap,
  ]

  return sitemap
}
