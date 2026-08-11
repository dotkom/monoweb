export const dynamic = "force-dynamic"

import { CourseFilterParsers } from "@/app/emner/course-filter-parsers"
import { env } from "@/env"
import { server } from "@/utils/trpc/server"
import { CourseFilterQuerySchema } from "@dotkomonline/grades-backend/course"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { createLoader } from "nuqs/server"
import { CourseListControls } from "./components/CourseListControls"

const loadSearchParams = createLoader(CourseFilterParsers)

export default async function CourseListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const parsed = loadSearchParams(sp)
  const filterQuery = CourseFilterQuerySchema.parse(parsed)

  const initialPage = await server.course.findCourses.query({
    filter: filterQuery,
  })

  return <CourseListControls defaultValues={filterQuery} initialPage={initialPage} />
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.courseListPage")

  const title = t("title")
  const description = t("description")
  const url = `${env.NEXT_PUBLIC_ORIGIN}/emner`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Grades.no",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  }
}
