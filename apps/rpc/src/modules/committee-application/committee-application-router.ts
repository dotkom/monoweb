import type { inferProcedureOutput } from "@trpc/server"
import { withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { CommitteeApplicationPeriodSummarySchema } from "./committee-application"

export type FindOpenCommitteeApplicationPeriodOutput = inferProcedureOutput<typeof findOpenPeriodProcedure>
const findOpenPeriodProcedure = procedure
  .output(CommitteeApplicationPeriodSummarySchema.nullable())
  .use(withDatabaseTransaction())
  .query(async ({ ctx }) => {
    return ctx.committeeApplicationService.findOpenPeriod(ctx.handle)
  })

export const committeeApplicationRouter = t.router({
  findOpenPeriod: findOpenPeriodProcedure,
})
