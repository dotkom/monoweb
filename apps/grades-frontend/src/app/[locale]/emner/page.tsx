import { env } from "@/env"
import { getPathname } from "@/i18n/navigation"
import { server } from "@/utils/trpc/server"
import { CourseFilterQuerySchema } from "@dotkomonline/grades-backend/course"
import { Title } from "@dotkomonline/ui"
import { toAbsoluteUrl } from "@dotkomonline/utils"
import type { Metadata } from "next"
import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"
import { createLoader } from "nuqs/server"
import { CourseListControls } from "./components/CourseListControls"
import { ScrollToTop } from "./components/ScrollToTop"
import { CourseFilterParsers } from "./course-filter-parsers"
import { routing } from "@/i18n/routing"

const loadSearchParams = createLoader(CourseFilterParsers)

export default async function CourseListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const t = await getTranslations("CourseListPage")
  const sp = await searchParams
  const parsed = loadSearchParams(sp)
  const filterQuery = CourseFilterQuerySchema.parse(parsed)

  const initialPage = await server.course.findCourses.query({
    filter: filterQuery,
  })

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <Title element="h1" className="text-xl sm:text-2xl font-bold tracking-tight">
        {t("heading")}
      </Title>
      <CourseListControls defaultValues={filterQuery} initialPage={initialPage} />
      <ScrollToTop />
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const t = await getTranslations("Metadata.courseListPage")
  const { locale: rawLocale } = await params
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale

  const title = t("title")
  const description = t("description")

  const noPath = getPathname({ href: `/emner`, locale: "no" })
  const enPath = getPathname({ href: `/emner`, locale: "en" })
  const canonicalPath = getPathname({ href: `/emner`, locale })
  const canonical = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, canonicalPath)
  const noUrl = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, noPath)
  const enUrl = toAbsoluteUrl(env.NEXT_PUBLIC_ORIGIN, enPath)

  return {
    title,
    description,
    alternates: {
      canonical: canonical,
      languages: { no: noUrl, en: enUrl, "x-default": noUrl },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Grades.no",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}
