import { MembershipApplicationSchema, UserIdSchema } from "@dotkomonline/types"
import { protectedProcedure, t } from "../../trpc"
import { z } from "zod"
import { PaginateInputSchema } from "@dotkomonline/core"

export const membershipApplicationRouter = t.router({
  create: protectedProcedure
    .input(MembershipApplicationSchema)
    .mutation(async ({ input, ctx }) => ctx.membershipApplicationService.create(input)),

  all: protectedProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.membershipApplicationService.getAll(input.take, input.cursor)),

  get: protectedProcedure
    .input(UserIdSchema)
    .query(async ({ input, ctx }) => ctx.membershipApplicationService.getById(input)),
  
  update: protectedProcedure
    .input(
      z.object({
        id: UserIdSchema,
        values: MembershipApplicationSchema,
      })
    )
    .mutation(async ({ input, ctx }) => ctx.membershipApplicationService.update(input.id, input.values)),
})
