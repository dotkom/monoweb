import { EventSchema, InterestGroupSchema, InterestGroupWriteSchema, UserSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, publicProcedure, t } from "../../trpc"

export const interestGroupRouter = t.router({
  create: adminProcedure
    .input(InterestGroupWriteSchema)
    .mutation(async ({ input, ctx }) => await ctx.interestGroupService.create(input)),
  all: publicProcedure.query(async ({ ctx }) => await ctx.interestGroupService.getAll()),
  get: publicProcedure
    .input(InterestGroupSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.interestGroupService.getById(input)),
  update: adminProcedure
    .input(
      z.object({
        id: InterestGroupSchema.shape.id,
        values: InterestGroupWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.interestGroupService.update(input.id, input.values)),
  delete: adminProcedure
    .input(InterestGroupSchema.shape.id)
    .mutation(async ({ input, ctx }) => await ctx.interestGroupService.delete(input)),
  getByMember: publicProcedure
    .input(UserSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.interestGroupService.getByMember(input)),
  getMembers: publicProcedure
    .input(InterestGroupSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.interestGroupService.getMembers(input)),
  addMember: adminProcedure
    .input(z.object({ interestGroupId: InterestGroupSchema.shape.id, userId: UserSchema.shape.id }))
    .mutation(async ({ input, ctx }) => await ctx.interestGroupService.addMember(input.interestGroupId, input.userId)),
  removeMember: adminProcedure
    .input(z.object({ interestGroupId: InterestGroupSchema.shape.id, userId: UserSchema.shape.id }))
    .mutation(
      async ({ input, ctx }) => await ctx.interestGroupService.removeMember(input.interestGroupId, input.userId)
    ),
  allByEventId: publicProcedure
    .input(EventSchema.shape.id)
    .query(async ({ input, ctx }) => await ctx.interestGroupService.getAllByEventId(input)),
})
