import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import z from "zod"
import { withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { CourseFilterQuerySchema } from "./course-types"

export type FindCoursesInput = inferProcedureInput<typeof findCoursesProcedure>
export type FindCoursesOutput = inferProcedureOutput<typeof findCoursesProcedure>
const findCoursesProcedure = procedure
  .input(
    z.object({
      filter: CourseFilterQuerySchema.optional(),
      offset: z.number().int().min(0).default(0),
      limit: z.number().int().min(1).max(100).default(20),
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const items = await ctx.courseService.findMany(ctx.handle, input.filter ?? {}, input.offset, input.limit)
    return items
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

export const courseRouter = t.router({
  findCourses: findCoursesProcedure,
  findCourse: findCourseProcedure,
})
