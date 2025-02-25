import { GroupSchema, GroupWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const groupRouter = t.router({
  create: t.procedure.input(GroupWriteSchema).mutation(async ({ input, ctx }) => ctx.groupService.createGroup(input)),
  all: t.procedure.query(async ({ ctx }) => ctx.groupService.getGroups()),
  allByType: t.procedure
    .input(GroupSchema.shape.type)
    .query(async ({ input, ctx }) => ctx.groupService.getGroupsByType(input)),
  allIds: t.procedure.query(async ({ ctx }) => ctx.groupService.getAllGroupIds()),
  allIdsByType: t.procedure
    .input(GroupSchema.shape.type)
    .query(async ({ input, ctx }) => ctx.groupService.getAllGroupIdsByType(input)),
  get: t.procedure.input(GroupSchema.shape.id).query(async ({ input, ctx }) => ctx.groupService.getGroup(input)),
  getByType: t.procedure
    .input(z.object({ groupId: GroupSchema.shape.id, type: GroupSchema.shape.type }))
    .query(async ({ input, ctx }) => ctx.groupService.getGroupByType(input.groupId, input.type)),
  update: protectedProcedure
    .input(
      z.object({
        id: GroupSchema.shape.id,
        values: GroupWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) => await ctx.groupService.updateGroup(input.id, input.values)),
  delete: protectedProcedure
    .input(GroupSchema.shape.id)
    .mutation(async ({ input, ctx }) => await ctx.groupService.deleteGroup(input)),
})
