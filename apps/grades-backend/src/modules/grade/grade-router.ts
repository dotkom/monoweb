import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { procedure, t } from "../../trpc"
import { withDatabaseTransaction } from "../../middlewares"
import { GradeSchema } from "./grade"

export type FindGradesInput = inferProcedureInput<typeof findGradesProcedure>
export type FindGradesOutput = inferProcedureOutput<typeof findGradesProcedure>
const findGradesProcedure = procedure.use(withDatabaseTransaction()).input(GradeSchema.shape.id).query(async ({ input, ctx }) => {
  const items = await ctx.gradeService.findMany(ctx.handle, input)
  return items
})

export const gradeRouter = t.router({
  findGrades: findGradesProcedure,
})
