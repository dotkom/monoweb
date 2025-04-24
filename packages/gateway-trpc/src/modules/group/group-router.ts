import { GroupMemberSchema, GroupMemberWriteSchema, GroupSchema, GroupWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, protectedProcedure, t } from "../../trpc"

export const groupRouter = t.router({
  create: adminProcedure
    .input(GroupWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.groupService.createGroup(input)),
  all: adminProcedure.query(async ({ ctx }) => ctx.groupService.getGroups()),
  allByType: adminProcedure
    .input(GroupSchema.shape.type)
    .query(async ({ input, ctx }) => ctx.groupService.getGroupsByType(input)),
  allIds: adminProcedure.query(async ({ ctx }) => ctx.groupService.getAllGroupIds()),
  allIdsByType: adminProcedure
    .input(GroupSchema.shape.type)
    .query(async ({ input, ctx }) => ctx.groupService.getAllGroupIdsByType(input)),
  get: adminProcedure.input(GroupSchema.shape.id).query(async ({ input, ctx }) => ctx.groupService.getGroup(input)),
  getByType: adminProcedure
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
  getMembers: adminProcedure
    .input(GroupMemberSchema.shape.userId)
    .query(async ({ input, ctx }) => ctx.groupService.getMembers(input)),
  allByMember: adminProcedure
    .input(GroupMemberSchema.shape.userId)
    .query(async ({ input, ctx }) => ctx.groupService.getGroupsByMember(input)),
  addMember: adminProcedure
    .input(GroupMemberWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.groupService.addMember(input)),
  removeMember: adminProcedure
    .input(z.object({ groupId: GroupMemberSchema.shape.groupId, userId: GroupMemberSchema.shape.userId }))
    .mutation(async ({ input, ctx }) => await ctx.groupService.removeMember(input.userId, input.groupId)),
})
