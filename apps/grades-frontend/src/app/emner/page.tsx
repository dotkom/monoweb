export const dynamic = "force-dynamic"

import { CourseFilterParsers } from "@/app/emner/course-filter-parsers"
import { server } from "@/utils/trpc/server"
import { CourseFilterQuerySchema } from "@dotkomonline/grades-backend/course"
import { createLoader } from "nuqs/server"
import { CourseCard } from "../components/CourseCard"
import { CourseFilters } from "./components/CourseFilters"

const loadSearchParams = createLoader(CourseFilterParsers)

export default async function CourseListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const parsed = loadSearchParams(sp)
  const filterQuery = CourseFilterQuerySchema.parse(parsed)

  const courses = await server.course.findCourses.query({
    filter: filterQuery,
  })

  return (
    <div className="w-full flex flex-col md:flex-row gap-6 md:gap-16">
      <CourseFilters defaultValues={filterQuery} />
      <section className="flex flex-col gap-4 w-full md:max-w-xl">
        {courses.map((course) => (
          <CourseCard key={course.code} course={course} />
        ))}
      </section>
    </div>
  )
}
