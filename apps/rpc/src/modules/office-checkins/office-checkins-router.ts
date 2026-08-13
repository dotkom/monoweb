import { z } from "zod"
import { withAuditLogEntry, withAuthentication, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { OfficeCheckinLinkSchema, PublicOfficeCheckinLeaderboardEntrySchema } from "./office-checkin"

const leaderboardProcedure = procedure
  .output(z.array(PublicOfficeCheckinLeaderboardEntrySchema))
  .use(withDatabaseTransaction())
  .query(async ({ ctx }) => {
    return await ctx.officeCheckinsService.getPublicLeaderboard(ctx.handle)
  })

const linkUserProcedure = procedure
  .input(OfficeCheckinLinkSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return await ctx.officeCheckinsService.linkUser(ctx.handle, ctx.principal.subject, input)
  })

export const officeCheckinsRouter = t.router({
  leaderboard: leaderboardProcedure,
  linkUser: linkUserProcedure,
})
