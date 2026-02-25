import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { procedure, t } from "../../trpc"
import { withDatabaseTransaction } from "../../middlewares"
import z from "zod"
import { BasePaginateInputSchema } from "src/query"
import { CourseFilterQuerySchema } from "./course"

export type FindCoursesInput = inferProcedureInput<typeof findCoursesProcedure>
export type FindCoursesOutput = inferProcedureOutput<typeof findCoursesProcedure>
const findCoursesProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: CourseFilterQuerySchema.optional() }).default({}))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const { filter, ...page } = input

    console.log(filter)

    const items = await ctx.courseService.findMany(ctx.handle, { ...filter }, page)
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
})
