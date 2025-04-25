import { GroupMemberSchema, GroupMemberWriteSchema, GroupSchema, GroupWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, protectedProcedure, publicProcedure, t } from "../../trpc"

export const groupRouter = t.router({
  create: adminProcedure
    .input(GroupWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.groupService.createGroup(input)),
  all: publicProcedure.query(async ({ ctx }) => ctx.groupService.getGroups()),
  allByType: publicProcedure
    .input(GroupSchema.shape.type)
    .query(async ({ input, ctx }) => ctx.groupService.getGroupsByType(input)),
  allIds: publicProcedure.query(async ({ ctx }) => ctx.groupService.getAllGroupIds()),
  allIdsByType: publicProcedure
    .input(GroupSchema.shape.type)
    .query(async ({ input, ctx }) => ctx.groupService.getAllGroupIdsByType(input)),
  get: publicProcedure.input(GroupSchema.shape.id).query(async ({ input, ctx }) => ctx.groupService.getGroup(input)),
  getByType: publicProcedure
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
  getMembers: publicProcedure
    .input(GroupMemberSchema.shape.userId)
    .query(async ({ input, ctx }) => ctx.groupService.getMembers(input)),
  allByMember: publicProcedure
    .input(GroupMemberSchema.shape.userId)
    .query(async ({ input, ctx }) => ctx.groupService.getGroupsByMember(input)),
  addMember: adminProcedure
    .input(GroupMemberWriteSchema)
    .mutation(async ({ input, ctx }) => ctx.groupService.addMember(input)),
  removeMember: adminProcedure
    .input(z.object({ groupId: GroupMemberSchema.shape.groupId, userId: GroupMemberSchema.shape.userId }))
    .mutation(async ({ input, ctx }) => await ctx.groupService.removeMember(input.userId, input.groupId)),
})
