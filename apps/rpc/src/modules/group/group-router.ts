import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import {
  GroupMembershipSchema,
  GroupMembershipWriteSchema,
  GroupRoleSchema,
  GroupRoleWriteSchema,
  GroupSchema,
  GroupWriteSchema,
} from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isAdministrator, isEditor, isGroupMember, or } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { EditorRole } from "../authorization-service"

export type CreateGroupInput = inferProcedureInput<typeof createGroupProcedure>
export type CreateGroupOutput = inferProcedureOutput<typeof createGroupProcedure>
const createGroupProcedure = procedure
  .input(GroupWriteSchema)
  .use(withAuthentication())
  .use(withAuthorization(or(isAdministrator(), isGroupMember(EditorRole.BACKLOG))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.groupService.create(ctx.handle, input)
  })

export type AllGroupsInput = inferProcedureInput<typeof allGroupsProcedure>
export type AllGroupsOutput = inferProcedureOutput<typeof allGroupsProcedure>
const allGroupsProcedure = procedure
  .use(withDatabaseTransaction())
  .query(async ({ ctx }) => ctx.groupService.findMany(ctx.handle))

export type AllGroupsByTypeInput = inferProcedureInput<typeof allByTypeProcedure>
export type AllGroupsByTypeOutput = inferProcedureOutput<typeof allByTypeProcedure>
const allByTypeProcedure = procedure
  .input(GroupSchema.shape.type)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.groupService.findManyByType(ctx.handle, input))

export type FindGroupInput = inferProcedureInput<typeof findGroupProcedure>
export type FindGroupOutput = inferProcedureOutput<typeof findGroupProcedure>
const findGroupProcedure = procedure
  .input(GroupSchema.shape.slug)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.groupService.findBySlug(ctx.handle, input))

export type GetGroupInput = inferProcedureInput<typeof getGroupProcedure>
export type GetGroupOutput = inferProcedureOutput<typeof getGroupProcedure>
const getGroupProcedure = procedure
  .input(GroupSchema.shape.slug)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.groupService.getBySlug(ctx.handle, input))

export type GetByTypeInput = inferProcedureInput<typeof getByTypeProcedure>
export type GetByTypeOutput = inferProcedureOutput<typeof getByTypeProcedure>
const getByTypeProcedure = procedure
  .input(z.object({ groupId: GroupSchema.shape.slug, type: GroupSchema.shape.type }))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.groupService.getBySlugAndType(ctx.handle, input.groupId, input.type))

export type UpdateGroupInput = inferProcedureInput<typeof updateGroupProcedure>
export type UpdateGroupOutput = inferProcedureOutput<typeof updateGroupProcedure>
const updateGroupProcedure = procedure
  .input(
    z.object({
      id: GroupSchema.shape.slug,
      values: GroupWriteSchema,
    })
  )
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isGroupMember(EditorRole.BACKLOG),
        isGroupMember((i) => i.id)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.id)

    // If this is not an interest group, deny Backlog from modifying
    if (group.type !== "INTEREST_GROUP") {
      await ctx.addAuthorizationGuard(
        or(
          isAdministrator(),
          isGroupMember(() => group.slug)
        ),
        input
      )
    }

    return ctx.groupService.update(ctx.handle, input.id, input.values)
  })

export type DeleteGroupInput = inferProcedureInput<typeof deleteGroupProcedure>
export type DeleteGroupOutput = inferProcedureOutput<typeof deleteGroupProcedure>
const deleteGroupProcedure = procedure
  .input(GroupSchema.shape.slug)
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isGroupMember(EditorRole.BACKLOG),
        isGroupMember((i) => i)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input)

    // If this is not an interest group, deny Backlog from modifying
    if (group.type !== "INTEREST_GROUP") {
      await ctx.addAuthorizationGuard(
        or(
          isAdministrator(),
          isGroupMember(() => group.slug)
        ),
        input
      )
    }

    return ctx.groupService.delete(ctx.handle, input)
  })

export type GetMembersInput = inferProcedureInput<typeof getMembersProcedure>
export type GetMembersOutput = inferProcedureOutput<typeof getMembersProcedure>
const getMembersProcedure = procedure
  .input(GroupSchema.shape.slug)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.groupService.getMembers(ctx.handle, input))

export type GetMemberInput = inferProcedureInput<typeof getMemberProcedure>
export type GetMemberOutput = inferProcedureOutput<typeof getMemberProcedure>
const getMemberProcedure = procedure
  .input(
    z.object({
      groupId: GroupSchema.shape.slug,
      userId: GroupMembershipSchema.shape.userId,
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.groupService.getMember(ctx.handle, input.groupId, input.userId))

export type AllByMemberInput = inferProcedureInput<typeof allByMemberProcedure>
export type AllByMemberOutput = inferProcedureOutput<typeof allByMemberProcedure>
const allByMemberProcedure = procedure
  .input(GroupMembershipSchema.shape.userId)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.groupService.findManyByMemberUserId(ctx.handle, input))

export type StartMembershipInput = inferProcedureInput<typeof startMembershipProcedure>
export type StartMembershipOutput = inferProcedureOutput<typeof startMembershipProcedure>
const startMembershipProcedure = procedure
  .input(
    z.object({
      userId: GroupMembershipSchema.shape.userId,
      groupId: GroupMembershipSchema.shape.groupId,
      roleIds: GroupRoleSchema.shape.id.array(),
    })
  )
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isGroupMember(EditorRole.BACKLOG),
        isGroupMember((i) => i.groupId)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.groupId)

    // If this is not an interest group, deny Backlog from modifying
    if (group.type !== "INTEREST_GROUP") {
      await ctx.addAuthorizationGuard(
        or(
          isAdministrator(),
          isGroupMember(() => group.slug)
        ),
        input
      )
    }

    return ctx.groupService.startMembership(ctx.handle, input.userId, input.groupId, new Set(input.roleIds))
  })

export type EndMembershipInput = inferProcedureInput<typeof endMembershipProcedure>
export type EndMembershipOutput = inferProcedureOutput<typeof endMembershipProcedure>
const endMembershipProcedure = procedure
  .input(z.object({ groupId: GroupMembershipSchema.shape.groupId, userId: GroupMembershipSchema.shape.userId }))
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isGroupMember(EditorRole.BACKLOG),
        isGroupMember((i) => i.groupId)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.groupId)

    // If this is not an interest group, deny Backlog from modifying
    if (group.type !== "INTEREST_GROUP") {
      await ctx.addAuthorizationGuard(
        or(
          isAdministrator(),
          isGroupMember(() => group.slug)
        ),
        input
      )
    }

    return ctx.groupService.endMembership(ctx.handle, input.userId, input.groupId)
  })

export type UpdateMembershipInput = inferProcedureInput<typeof updateMembershipProcedure>
export type UpdateMembershipOutput = inferProcedureOutput<typeof updateMembershipProcedure>
const updateMembershipProcedure = procedure
  .input(
    z.object({
      id: GroupMembershipSchema.shape.id,
      data: GroupMembershipWriteSchema,
      roleIds: GroupRoleSchema.shape.id.array(),
    })
  )
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isGroupMember(EditorRole.BACKLOG),
        isGroupMember((i) => i.id)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getByGroupMembershipId(ctx.handle, input.id)

    // If this is not an interest group, deny Backlog from modifying
    if (group.type !== "INTEREST_GROUP") {
      await ctx.addAuthorizationGuard(
        or(
          isAdministrator(),
          isGroupMember(() => group.slug)
        ),
        input
      )
    }

    return ctx.groupService.updateMembership(ctx.handle, input.id, input.data, new Set(input.roleIds))
  })

export type CreateRoleInput = inferProcedureInput<typeof createRoleProcedure>
export type CreateRoleOutput = inferProcedureOutput<typeof createRoleProcedure>
const createRoleProcedure = procedure
  .input(GroupRoleWriteSchema)
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isGroupMember(EditorRole.BACKLOG),
        isGroupMember((i) => i.groupId)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.groupId)

    // If this is not an interest group, deny Backlog from modifying
    if (group.type !== "INTEREST_GROUP") {
      await ctx.addAuthorizationGuard(
        or(
          isAdministrator(),
          isGroupMember(() => group.slug)
        ),
        input
      )
    }

    return ctx.groupService.createRole(ctx.handle, input)
  })

export type UpdateRoleInput = inferProcedureInput<typeof updateRoleProcedure>
export type UpdateRoleOutput = inferProcedureOutput<typeof updateRoleProcedure>
const updateRoleProcedure = procedure
  .input(
    z.object({
      id: GroupRoleSchema.shape.id,
      role: GroupRoleWriteSchema,
    })
  )
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isGroupMember(EditorRole.BACKLOG),
        isGroupMember((i) => i.id)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getByGroupRoleId(ctx.handle, input.id)

    // If this is not an interest group, deny Backlog from modifying
    if (group.type !== "INTEREST_GROUP") {
      await ctx.addAuthorizationGuard(
        or(
          isAdministrator(),
          isGroupMember(() => group.slug)
        ),
        input
      )
    }

    return ctx.groupService.updateRole(ctx.handle, input.id, input.role)
  })

export type CreateFileUploadInput = inferProcedureInput<typeof createFileUploadProcedure>
export type CreateFileUploadOutput = inferProcedureOutput<typeof createFileUploadProcedure>
const createFileUploadProcedure = procedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
    })
  )
  .output(z.custom<PresignedPost>())
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .mutation(async ({ input, ctx }) => {
    return ctx.groupService.createFileUpload(input.filename, input.contentType, ctx.principal.subject)
  })

export const groupRouter = t.router({
  create: createGroupProcedure,
  all: allGroupsProcedure,
  allByType: allByTypeProcedure,
  find: findGroupProcedure,
  get: getGroupProcedure,
  getByType: getByTypeProcedure,
  update: updateGroupProcedure,
  delete: deleteGroupProcedure,
  getMembers: getMembersProcedure,
  getMember: getMemberProcedure,
  allByMember: allByMemberProcedure,
  startMembership: startMembershipProcedure,
  endMembership: endMembershipProcedure,
  updateMembership: updateMembershipProcedure,
  createRole: createRoleProcedure,
  updateRole: updateRoleProcedure,
  createFileUpload: createFileUploadProcedure,
})
