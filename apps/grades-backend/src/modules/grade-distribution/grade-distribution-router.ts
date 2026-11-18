import { procedure, t } from "../../trpc"
import { CourseSchema } from "../course/course-types"

const findGradeDistributionsProcedure = procedure.input(CourseSchema.shape.code).query(async ({ input, ctx }) => {
  const items = await ctx.gradeDistributionService.findMany(ctx.prisma, input)
  return items
})

export const gradeDistributionRouter = t.router({
  findGradeDistributions: findGradeDistributionsProcedure,
})
