import {
  GroupMembershipSchema,
  GroupMembershipWriteSchema,
  GroupRoleSchema,
  GroupRoleWriteSchema,
  GroupSchema,
  GroupWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { procedure, staffProcedure, t } from "../../trpc"

export const groupRouter = t.router({
  create: staffProcedure.input(GroupWriteSchema).mutation(async ({ input, ctx }) => {
    ctx.authorize.requireAffiliation("dotkom", "backlog", "hs")
    return ctx.executeTransaction(async (handle) => ctx.groupService.create(handle, input))
  }),
  all: procedure.query(async ({ ctx }) => ctx.executeTransaction(async (handle) => ctx.groupService.getAll(handle))),
  allByType: procedure
    .input(GroupSchema.shape.type)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getAllByType(handle, input))
    ),
  get: procedure
    .input(GroupSchema.shape.slug)
    .query(async ({ input, ctx }) => ctx.executeTransaction(async (handle) => ctx.groupService.getById(handle, input))),
  getByType: procedure
    .input(z.object({ groupId: GroupSchema.shape.slug, type: GroupSchema.shape.type }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getByIdAndType(handle, input.groupId, input.type))
    ),
  update: staffProcedure
    .input(
      z.object({
        id: GroupSchema.shape.slug,
        values: GroupWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireAffiliation("dotkom", "backlog", "hs")
      return ctx.executeTransaction(async (handle) => ctx.groupService.update(handle, input.id, input.values))
    }),
  delete: staffProcedure.input(GroupSchema.shape.slug).mutation(async ({ input, ctx }) => {
    ctx.authorize.requireAffiliation("dotkom", "backlog", "hs")
    return ctx.executeTransaction(async (handle) => ctx.groupService.delete(handle, input))
  }),
  getMembers: procedure
    .input(GroupSchema.shape.slug)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getMembers(handle, input))
    ),
  getMember: procedure
    .input(
      z.object({
        groupId: GroupSchema.shape.slug,
        userId: GroupMembershipSchema.shape.userId,
      })
    )
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getMember(handle, input.groupId, input.userId))
    ),
  allByMember: procedure
    .input(GroupMembershipSchema.shape.userId)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getAllByMember(handle, input))
    ),
  startMembership: staffProcedure
    .input(
      z.object({
        userId: GroupMembershipSchema.shape.userId,
        groupId: GroupMembershipSchema.shape.groupId,
        roleIds: GroupRoleSchema.shape.id.array(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.groupService.startMembership(handle, input.userId, input.groupId, new Set(input.roleIds))
      )
    ),
  endMembership: staffProcedure
    .input(z.object({ groupId: GroupMembershipSchema.shape.groupId, userId: GroupMembershipSchema.shape.userId }))
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.endMembership(handle, input.userId, input.groupId))
    ),
  updateMembership: staffProcedure
    .input(
      z.object({
        id: GroupMembershipSchema.shape.id,
        data: GroupMembershipWriteSchema,
        roleIds: GroupRoleSchema.shape.id.array(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.groupService.updateMembership(handle, input.id, input.data, new Set(input.roleIds))
      )
    ),
  createRole: staffProcedure
    .input(GroupRoleWriteSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.createRole(handle, input))
    ),
  updateRole: staffProcedure
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
