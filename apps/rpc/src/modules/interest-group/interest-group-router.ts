import { EventSchema, InterestGroupSchema, InterestGroupWriteSchema, UserSchema } from "@dotkomonline/types"
import { z } from "zod"
import { procedure, t } from "../../trpc"

export const interestGroupRouter = t.router({
  create: procedure.input(InterestGroupWriteSchema).mutation(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.create(handle, input)
    })
  ),
  all: procedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.getAll(handle)
    })
  ),
  get: procedure.input(InterestGroupSchema.shape.id).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.getById(handle, input)
    })
  ),
  update: procedure
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
  delete: procedure.input(InterestGroupSchema.shape.id).mutation(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.delete(handle, input)
    })
  ),
  getByMember: procedure.input(UserSchema.shape.id).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.getByMember(handle, input)
    })
  ),
  getMembers: procedure.input(InterestGroupSchema.shape.id).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.getMembers(handle, input)
    })
  ),
  addMember: procedure
    .input(z.object({ interestGroupId: InterestGroupSchema.shape.id, userId: UserSchema.shape.id }))
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return await ctx.interestGroupService.addMember(handle, input.interestGroupId, input.userId)
      })
    ),
  removeMember: procedure
    .input(z.object({ interestGroupId: InterestGroupSchema.shape.id, userId: UserSchema.shape.id }))
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return await ctx.interestGroupService.removeMember(handle, input.interestGroupId, input.userId)
      })
    ),
  allByEventId: procedure.input(EventSchema.shape.id).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return await ctx.interestGroupService.getAllByEventId(handle, input)
    })
  ),
})
