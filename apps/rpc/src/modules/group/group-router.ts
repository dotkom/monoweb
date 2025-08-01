import {
  GroupMembershipSchema,
  GroupMembershipWriteSchema,
  GroupRoleSchema,
  GroupRoleWriteSchema,
  GroupSchema,
  GroupWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { authenticatedProcedure, procedure, t } from "../../trpc"

export const groupRouter = t.router({
  create: procedure
    .input(GroupWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.create(handle, input))
    ),
  all: procedure.query(async ({ ctx }) => ctx.executeTransaction(async (handle) => ctx.groupService.getAll(handle))),
  allByType: procedure
    .input(GroupSchema.shape.type)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getAllByType(handle, input))
    ),
  allIds: procedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => ctx.groupService.getAllIds(handle))
  ),
  allIdsByType: procedure
    .input(GroupSchema.shape.type)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getAllIdsByType(handle, input))
    ),
  get: procedure
    .input(GroupSchema.shape.slug)
    .query(async ({ input, ctx }) => ctx.executeTransaction(async (handle) => ctx.groupService.getById(handle, input))),
  getByType: procedure
    .input(z.object({ groupId: GroupSchema.shape.slug, type: GroupSchema.shape.type }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getByIdAndType(handle, input.groupId, input.type))
    ),
  update: procedure
    .input(
      z.object({
        id: GroupSchema.shape.slug,
        values: GroupWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.update(handle, input.id, input.values))
    ),
  delete: procedure
    .input(GroupSchema.shape.slug)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.delete(handle, input))
    ),
  getMembers: procedure
    .input(GroupSchema.shape.slug)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getMembers(handle, input))
    ),
  allByMember: procedure
    .input(GroupMembershipSchema.shape.userId)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getAllByMember(handle, input))
    ),
  addMember: procedure
    .input(GroupMembershipWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.addMember(handle, input))
    ),
  removeMember: procedure
    .input(z.object({ groupId: GroupMembershipSchema.shape.groupId, userId: GroupMembershipSchema.shape.userId }))
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.removeMember(handle, input.userId, input.groupId))
    ),
  createRole: authenticatedProcedure
    .input(GroupRoleWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.createRole(handle, input))
    ),
  updateRole: authenticatedProcedure
    .input(
      z.object({
        id: GroupRoleSchema.shape.id,
        role: GroupRoleWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.updateRole(handle, input.id, input.role))
    ),
})
