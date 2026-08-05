import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { procedure, t } from "../../trpc"
import { withDatabaseTransaction } from "../../middlewares"
import { CourseSchema } from "../course/course-types"

export type FindGradeDistributionsInput = inferProcedureInput<typeof findGradeDistributionsProcedure>
export type FindGradeDistributionsOutput = inferProcedureOutput<typeof findGradeDistributionsProcedure>
const findGradeDistributionsProcedure = procedure
  .use(withDatabaseTransaction())
  .input(CourseSchema.shape.code)
  .query(async ({ input, ctx }) => {
    const items = await ctx.gradeDistributionService.findMany(ctx.handle, input)
    return items
  })

export const gradeDistributionRouter = t.router({
  findGradeDistributions: findGradeDistributionsProcedure,
})
