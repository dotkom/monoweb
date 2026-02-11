import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { procedure, t } from "../../trpc"
import { withDatabaseTransaction } from "../../middlewares"
import { CourseSchema } from "../course/course"

export type FindGradesInput = inferProcedureInput<typeof findGradesProcedure>
export type FindGradesOutput = inferProcedureOutput<typeof findGradesProcedure>
const findGradesProcedure = procedure
  .use(withDatabaseTransaction())
  .input(CourseSchema.shape.code)
  .query(async ({ input, ctx }) => {
    const items = await ctx.gradeService.findMany(ctx.handle, input)
    return items
  })

export const gradeRouter = t.router({
  findGrades: findGradesProcedure,
})
