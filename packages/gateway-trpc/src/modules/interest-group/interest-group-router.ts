import { PaginateInputSchema } from "@dotkomonline/core"
import { InterestGroupSchema, InterestGroupWriteSchema, UserSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const interestGroupRouter = t.router({
  create: protectedProcedure
    .input(InterestGroupWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.interestGroupService.create(input)),
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => await ctx.interestGroupService.getAll(input)),
  get: publicProcedure
    .input(InterestGroupSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.interestGroupService.getById(input)),
  update: protectedProcedure
    .input(
      z.object({
        id: InterestGroupSchema.shape.id,
        values: InterestGroupWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.interestGroupService.update(input.id, input.values)),
  delete: protectedProcedure
    .input(InterestGroupSchema.shape.id)
    .mutation(async ({ input, ctx }) => await ctx.interestGroupService.delete(input)),
  getByMember: publicProcedure
    .input(UserSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.interestGroupService.getByMember(input)),
  getMembers: publicProcedure
    .input(InterestGroupSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.interestGroupService.getMembers(input)),
  addMember: protectedProcedure
    .input(z.object({ interestGroupId: InterestGroupSchema.shape.id, userId: UserSchema.shape.id }))
    .mutation(async ({ input, ctx }) => await ctx.interestGroupService.addMember(input.interestGroupId, input.userId)),
  removeMember: protectedProcedure
    .input(z.object({ interestGroupId: InterestGroupSchema.shape.id, userId: UserSchema.shape.id }))
    .mutation(
      async ({ input, ctx }) => await ctx.interestGroupService.removeMember(input.interestGroupId, input.userId)
    ),
})
