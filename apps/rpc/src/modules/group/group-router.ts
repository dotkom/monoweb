import { GroupMemberSchema, GroupMemberWriteSchema, GroupSchema, GroupWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, protectedProcedure, publicProcedure, t } from "../../trpc"

export const groupRouter = t.router({
  create: adminProcedure
    .input(GroupWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.create(handle, input))
    ),
  all: publicProcedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => ctx.groupService.getAll(handle))
  ),
  allByType: publicProcedure
    .input(GroupSchema.shape.type)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getAllByType(handle, input))
    ),
  allIds: publicProcedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => ctx.groupService.getAllIds(handle))
  ),
  allIdsByType: publicProcedure
    .input(GroupSchema.shape.type)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getAllIdsByType(handle, input))
    ),
  get: publicProcedure
    .input(GroupSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.executeTransaction(async (handle) => ctx.groupService.getById(handle, input))),
  getByType: publicProcedure
    .input(z.object({ groupId: GroupSchema.shape.id, type: GroupSchema.shape.type }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getByIdAndType(handle, input.groupId, input.type))
    ),
  update: protectedProcedure
    .input(
      z.object({
        id: GroupSchema.shape.id,
        values: GroupWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.update(handle, input.id, input.values))
    ),
  delete: protectedProcedure
    .input(GroupSchema.shape.id)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.delete(handle, input))
    ),
  getMembers: publicProcedure
    .input(GroupMemberSchema.shape.userId)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getMembers(handle, input))
    ),
  allByMember: publicProcedure
    .input(GroupMemberSchema.shape.userId)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getAllByMember(handle, input))
    ),
  addMember: adminProcedure
    .input(GroupMemberWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.addMember(handle, input))
    ),
  removeMember: adminProcedure
    .input(z.object({ groupId: GroupMemberSchema.shape.groupId, userId: GroupMemberSchema.shape.userId }))
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.removeMember(handle, input.userId, input.groupId))
    ),
})
