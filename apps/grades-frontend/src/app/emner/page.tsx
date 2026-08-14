import { CourseFilterParsers } from "@/app/emner/course-filter-parsers"
import { env } from "@/env"
import { server } from "@/utils/trpc/server"
import { CourseFilterQuerySchema } from "@dotkomonline/grades-backend/course"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { createLoader } from "nuqs/server"
import { CourseListControls } from "./components/CourseListControls"
import { Title } from "@dotkomonline/ui"

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
    </div>
  )
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
