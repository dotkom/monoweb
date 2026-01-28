import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { procedure, t } from "../../trpc"
import { withDatabaseTransaction } from "../../middlewares"

export type FindCoursesInput = inferProcedureInput<typeof findCoursesProcedure>
export type FindCoursesOutput = inferProcedureOutput<typeof findCoursesProcedure>
const findCoursesProcedure = procedure.use(withDatabaseTransaction()).query(async ({ ctx }) => {
  const items = await ctx.courseService.findMany(ctx.handle)
  return items
})

export const courseRouter = t.router({
  findCourses: findCoursesProcedure,
})
