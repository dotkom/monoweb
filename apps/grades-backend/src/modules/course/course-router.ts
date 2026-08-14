import { getCurrentUTC } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import z from "zod"
import { withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { CourseFilterQuerySchema, type Semester } from "./course-types"

export type FindCoursesInput = inferProcedureInput<typeof findCoursesProcedure>
export type FindCoursesOutput = inferProcedureOutput<typeof findCoursesProcedure>
const findCoursesProcedure = procedure
  .input(
    z.object({
      filter: CourseFilterQuerySchema.optional(),
      // Tanstack InfiniteQuery expects offset to be called cursor
      cursor: z.int().min(0).default(0),
      limit: z.int().min(1).max(100).default(20),
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { courses: items, totalCount } = await ctx.courseService.findMany(
      ctx.handle,
      input.filter ?? {},
      input.cursor,
      input.limit
    )

    const nextCursor = items.length === input.limit ? input.cursor + input.limit : undefined

    return {
      items,
      nextCursor,
      totalCount,
    }
  })

export type FindCourseInput = inferProcedureInput<typeof findCourseProcedure>
export type FindCourseOutput = inferProcedureOutput<typeof findCourseProcedure>
const findCourseProcedure = procedure
  .input(z.string())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const course = await ctx.courseService.find(ctx.handle, input)
    return course
  })

export type FindFacultiesInput = inferProcedureInput<typeof findFacultiesProcedure>
export type FindFacultiesOutput = inferProcedureOutput<typeof findFacultiesProcedure>
const findFacultiesProcedure = procedure.use(withDatabaseTransaction()).query(async ({ ctx }) => {
  const faculties = await ctx.courseService.findManyFaculties(ctx.handle)
  return faculties
})

export type FindDepartmentsInput = inferProcedureInput<typeof findDepartmentsProcedure>
export type FindDepartmentsOutput = inferProcedureOutput<typeof findDepartmentsProcedure>
const findDepartmentsProcedure = procedure.use(withDatabaseTransaction()).query(async ({ ctx }) => {
  const departments = await ctx.courseService.findManyDepartments(ctx.handle)
  return departments
})

export type FindManySitemapEntriesInput = inferProcedureInput<typeof findManySitemapEntriesProcedure>
export type FindManySitemapEntriesOutput = inferProcedureOutput<typeof findManySitemapEntriesProcedure>
const findManySitemapEntriesProcedure = procedure.use(withDatabaseTransaction()).query(async ({ ctx }) => {
  return await ctx.courseService.findManySitemapEntries(ctx.handle)
})

export type FindFeaturedCoursesInput = inferProcedureInput<typeof findFeaturedCoursesProcedure>
export type FindFeaturedCoursesOutput = inferProcedureOutput<typeof findFeaturedCoursesProcedure>
const findFeaturedCoursesProcedure = procedure.use(withDatabaseTransaction()).query(async ({ ctx }) => {
  const currentMonth = getCurrentUTC().getMonth()
  const maxCoursesPerSection = 5

  // May-November is autumn, December-April is spring
  const activeSemester: Semester = currentMonth >= 4 && currentMonth <= 10 ? "AUTUMN" : "SPRING"

  const coursesToFetch = maxCoursesPerSection * 2

  const [activeSemesterCourses, largestCourses] = await Promise.all([
    ctx.courseService.findMany(
      ctx.handle,
      {
        bySemester: [activeSemester],
        sortBy: ["CANDIDATE_COUNT"],
      },
      0,
      coursesToFetch
    ),
    ctx.courseService.findMany(
      ctx.handle,
      {
        sortBy: ["CANDIDATE_COUNT"],
      },
      0,
      coursesToFetch
    ),
  ])

  // Dedupe courses so the sections don't show the same course twice
  const resolvedLargestCourses = largestCourses.courses.slice(0, maxCoursesPerSection)
  const resolvedActiveSemesterCourses = activeSemesterCourses.courses
    .filter((course) => !resolvedLargestCourses.some((c) => c.id === course.id))
    .slice(0, maxCoursesPerSection)

  return {
    activeSemesterCourses: resolvedActiveSemesterCourses,
    largestCourses: resolvedLargestCourses,
    activeSemester,
  }
})

export const courseRouter = t.router({
  findCourses: findCoursesProcedure,
  findCourse: findCourseProcedure,
  findFaculties: findFacultiesProcedure,
  findDepartments: findDepartmentsProcedure,
  findManySitemapEntries: findManySitemapEntriesProcedure,
  findFeaturedCourses: findFeaturedCoursesProcedure,
})
