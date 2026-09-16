import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { procedure, t } from "../../trpc"
import { CourseSchema } from "../course/course-types"

export type FindGradeDistributionsInput = inferProcedureInput<typeof findGradeDistributionsProcedure>
export type FindGradeDistributionsOutput = inferProcedureOutput<typeof findGradeDistributionsProcedure>
const findGradeDistributionsProcedure = procedure.input(CourseSchema.shape.code).query(async ({ input, ctx }) => {
  const items = await ctx.gradeDistributionService.findMany(ctx.prisma, input)
  return items
})

export const gradeDistributionRouter = t.router({
  findGradeDistributions: findGradeDistributionsProcedure,
})
