import { MembershipApplicationSchema } from "@dotkomonline/types"
import { protectedProcedure, t } from "../../trpc"

export const membershipApplicationRouter = t.router({
  create: protectedProcedure
    .input(MembershipApplicationSchema)
    .mutation(async ({ input, ctx }) => ctx.membershipApplicationService.create(input)),
})
