export const dynamic = "force-dynamic"

import { CourseFilterParsers } from "@/app/emner/course-filter-parsers"
import { server } from "@/utils/trpc/server"
import { CourseFilterQuerySchema } from "@dotkomonline/grades-backend/course"
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
