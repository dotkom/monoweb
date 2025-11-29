import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import {
  type Group,
  GroupMembershipSchema,
  GroupMembershipWriteSchema,
  GroupRoleSchema,
  GroupRoleWriteSchema,
  GroupSchema,
  GroupWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { type Context, procedure, staffProcedure, t } from "../../trpc"
import type { Affiliation } from "../authorization-service"

const getRequiredAffiliations = (
  ctx: Context,
  group: Partial<Pick<Group, "slug" | "type">>,
  options?: { includeGroupSlug: boolean }
) => {
  const requiredAffiliations: Affiliation[] = [...ctx.authorize.ADMIN_AFFILIATIONS]

  if (options?.includeGroupSlug && group.slug) {
    // We do not know that the slug is an affiliation but `requireAffiliation` ignores all invalid inputs
    // For example, interest groups have slugs but are not affiliations, and will be ignored.
    requiredAffiliations.push(group.slug as Affiliation)
  }

  if (group.type === "INTEREST_GROUP") {
    requiredAffiliations.push("backlog")
  }

  return requiredAffiliations
}

export const groupRouter = t.router({
  create: staffProcedure.input(GroupWriteSchema).mutation(async ({ input, ctx }) => {
    ctx.authorize.requireAffiliation(...getRequiredAffiliations(ctx, input))
    return ctx.executeAuditedTransaction(async (handle) => ctx.groupService.create(handle, input))
  }),
  all: procedure.query(async ({ ctx }) => ctx.executeTransaction(async (handle) => ctx.groupService.getAll(handle))),
  allByType: procedure
    .input(GroupSchema.shape.type)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.getAllByType(handle, input))
    ),
  find: procedure
    .input(GroupSchema.shape.slug)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.groupService.findById(handle, input))
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
      return ctx.executeAuditedTransaction(async (handle) => {
        const group = await ctx.groupService.getById(handle, input.id)

        ctx.authorize.requireAffiliation(...getRequiredAffiliations(ctx, group, { includeGroupSlug: true }))

        return await ctx.groupService.update(handle, input.id, input.values)
      })
    }),
  delete: staffProcedure.input(GroupSchema.shape.slug).mutation(async ({ input, ctx }) => {
    return ctx.executeAuditedTransaction(async (handle) => {
      const group = await ctx.groupService.getById(handle, input)

      ctx.authorize.requireAffiliation(...getRequiredAffiliations(ctx, group))

      return await ctx.groupService.delete(handle, input)
    })
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
      ctx.executeAuditedTransaction(async (handle) => {
        const group = await ctx.groupService.getById(handle, input.groupId)

        ctx.authorize.requireAffiliation(...getRequiredAffiliations(ctx, group, { includeGroupSlug: true }))

        return ctx.groupService.startMembership(handle, input.userId, input.groupId, new Set(input.roleIds))
      })
    ),
  endMembership: staffProcedure
    .input(z.object({ groupId: GroupMembershipSchema.shape.groupId, userId: GroupMembershipSchema.shape.userId }))
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) => {
        const group = await ctx.groupService.getById(handle, input.groupId)

        ctx.authorize.requireAffiliation(...getRequiredAffiliations(ctx, group, { includeGroupSlug: true }))

        return ctx.groupService.endMembership(handle, input.userId, input.groupId)
      })
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
      ctx.executeAuditedTransaction(async (handle) => {
        const group = await ctx.groupService.getByGroupMembershipId(handle, input.id)

        ctx.authorize.requireAffiliation(...getRequiredAffiliations(ctx, group, { includeGroupSlug: true }))

        return ctx.groupService.updateMembership(handle, input.id, input.data, new Set(input.roleIds))
      })
    ),
  createRole: staffProcedure.input(GroupRoleWriteSchema).mutation(async ({ input, ctx }) =>
    ctx.executeAuditedTransaction(async (handle) => {
      const group = await ctx.groupService.getById(handle, input.groupId)

      ctx.authorize.requireAffiliation(...getRequiredAffiliations(ctx, group, { includeGroupSlug: true }))

      return ctx.groupService.createRole(handle, input)
    })
  ),
  updateRole: staffProcedure
    .input(
      z.object({
        id: GroupRoleSchema.shape.id,
        role: GroupRoleWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) => {
        const group = await ctx.groupService.getByGroupRoleId(handle, input.id)

        ctx.authorize.requireAffiliation(...getRequiredAffiliations(ctx, group, { includeGroupSlug: true }))

        return ctx.groupService.updateRole(handle, input.id, input.role)
      })
    ),
  createFileUpload: staffProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
      })
    )
    .output(z.custom<PresignedPost>())
    .mutation(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) => {
        return ctx.groupService.createFileUpload(handle, input.filename, input.contentType, ctx.principal.subject)
      })
    }),
})
