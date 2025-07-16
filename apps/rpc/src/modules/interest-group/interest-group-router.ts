import { Auth0UserSchema, EventSchema, InterestGroupSchema, InterestGroupWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, publicProcedure, t } from "../../trpc"

export const interestGroupRouter = t.router({
  create: adminProcedure.input(InterestGroupWriteSchema).mutation(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.create(handle, input)
    })
  ),
  all: publicProcedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.getAll(handle)
    })
  ),
  get: publicProcedure.input(InterestGroupSchema.shape.id).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.getById(handle, input)
    })
  ),
  update: adminProcedure
    .input(
      z.object({
        id: InterestGroupSchema.shape.id,
        values: InterestGroupWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return await ctx.interestGroupService.update(handle, input.id, input.values)
      })
    ),
  delete: adminProcedure.input(InterestGroupSchema.shape.id).mutation(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.delete(handle, input)
    })
  ),
  getByMember: publicProcedure.input(Auth0UserSchema.shape.id).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.getByMember(handle, input)
    })
  ),
  getMembers: publicProcedure.input(InterestGroupSchema.shape.id).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.getMembers(handle, input)
    })
  ),
  addMember: adminProcedure
    .input(z.object({ interestGroupId: InterestGroupSchema.shape.id, userId: Auth0UserSchema.shape.id }))
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return await ctx.interestGroupService.addMember(handle, input.interestGroupId, input.userId)
      })
    ),
  removeMember: adminProcedure
    .input(z.object({ interestGroupId: InterestGroupSchema.shape.id, userId: Auth0UserSchema.shape.id }))
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return await ctx.interestGroupService.removeMember(handle, input.interestGroupId, input.userId)
      })
    ),
  allByEventId: publicProcedure.input(EventSchema.shape.id).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.getAllByEventId(handle, input)
    })
  ),
})
