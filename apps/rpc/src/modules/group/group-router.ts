import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { hasGroupRole, isAdministrator, isCommitteeMember, isGroupMember, or } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { CommitteeGroupSlug } from "../authorization-service"
import {
  type Group,
  GroupByMemberFilterSchema,
  GroupMembershipSchema,
  GroupMembershipWriteSchema,
  GroupRoleSchema,
  GroupRoleTypeEnum,
  GroupRoleWriteSchema,
  GroupSchema,
  GroupWriteSchema,
} from "./group"

type GroupScope = [Pick<Group, "type">, ...Pick<Group, "type">[]]

// Backlog counts as an administrator for interest groups
const hasGroupAdministratorAccess = (...groups: GroupScope) =>
  groups.every((group) => group.type === "INTEREST_GROUP")
    ? or(isAdministrator(), isGroupMember(CommitteeGroupSlug.BACKLOG))
    : isAdministrator()

const hasGroupManagerAccess = (group: Pick<Group, "slug" | "type">, ...groups: Pick<Group, "type">[]) =>
  or(
    hasGroupAdministratorAccess(group, ...groups),
    hasGroupRole(group.slug, GroupRoleTypeEnum.LEADER),
    hasGroupRole(group.slug, GroupRoleTypeEnum.DEPUTY_LEADER)
  )

export type CreateGroupInput = inferProcedureInput<typeof createGroupProcedure>
export type CreateGroupOutput = inferProcedureOutput<typeof createGroupProcedure>
const createGroupProcedure = procedure
  .input(GroupWriteSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    await ctx.addAuthorizationGuard(hasGroupAdministratorAccess(input), input)

    const createdGroup = await ctx.groupService.create(ctx.handle, input)

    ctx.setAuditTransactionName(`Create Group(Slug=${createdGroup.slug},Name=${createdGroup.name})`)

    return createdGroup
  })

export type AllGroupsInput = inferProcedureInput<typeof allGroupsProcedure>
export type AllGroupsOutput = inferProcedureOutput<typeof allGroupsProcedure>
const allGroupsProcedure = procedure
  .input(z.object({ filter: z.object({ includeEmailGroups: z.boolean().optional() }).optional() }).optional())
  .use(withDatabaseTransaction())
  .query(async ({ ctx, input }) =>
    ctx.groupService.findMany(ctx.handle, { includeEmailGroups: input?.filter?.includeEmailGroups ?? false })
  )

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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.id)

    await ctx.addAuthorizationGuard(hasGroupManagerAccess(group, input.values), input)

    const updatedGroup = await ctx.groupService.update(ctx.handle, input.id, input.values)

    ctx.setAuditTransactionName(`Update Group(Slug=${updatedGroup.slug},Name=${updatedGroup.name})`)

    return updatedGroup
  })

export type DeleteGroupInput = inferProcedureInput<typeof deleteGroupProcedure>
export type DeleteGroupOutput = inferProcedureOutput<typeof deleteGroupProcedure>
const deleteGroupProcedure = procedure
  .input(GroupSchema.shape.slug)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input)

    await ctx.addAuthorizationGuard(hasGroupAdministratorAccess(group), input)

    const deletedGroup = await ctx.groupService.delete(ctx.handle, input)

    ctx.setAuditTransactionName(`Delete Group(Slug=${deletedGroup.slug},Name=${deletedGroup.name})`)

    return deletedGroup
  })

export type GetMembersInput = inferProcedureInput<typeof getMembersProcedure>
export type GetMembersOutput = inferProcedureOutput<typeof getMembersProcedure>
const getMembersProcedure = procedure
  .input(GroupSchema.shape.slug)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    // We only show leaders of groups to unathenticated users, except for Hovedstyret who is public
    if (!ctx.principal && input !== CommitteeGroupSlug.HOVEDSTYRET) {
      return ctx.groupService.findLeadersBySlug(ctx.handle, input)
    }
    return ctx.groupService.findMembersBySlug(ctx.handle, input)
  })

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
  .input(
    z.object({
      userId: GroupMembershipSchema.shape.userId,
      filter: GroupByMemberFilterSchema.optional(),
    })
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) =>
    ctx.groupService.findManyByMemberUserId(ctx.handle, input.userId, {
      includeEmailGroups: input.filter?.includeEmailGroups ?? false,
      includeEmailOnlyMemberships: input.filter?.includeEmailOnlyMemberships ?? false,
    })
  )

export type AllMembershipsByUserIdInput = inferProcedureInput<typeof allMembershipsByUserIdProcedure>
export type AllMembershipsByUserIdOutput = inferProcedureOutput<typeof allMembershipsByUserIdProcedure>
const allMembershipsByUserIdProcedure = procedure
  .input(GroupMembershipSchema.shape.userId)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => ctx.groupService.allMembershipsByUserId(ctx.handle, input))

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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.groupId)

    await ctx.addAuthorizationGuard(hasGroupManagerAccess(group), input)

    const groupMember = await ctx.groupService.startMembership(
      ctx.handle,
      input.userId,
      input.groupId,
      new Set(input.roleIds)
    )

    ctx.setAuditTransactionName(
      `Start GroupMembership for User(ID=${groupMember.id},Name=${groupMember.name}) in Group(Slug=${input.groupId},Name=${group.name})`
    )

    return groupMember
  })

export type EndMembershipInput = inferProcedureInput<typeof endMembershipProcedure>
export type EndMembershipOutput = inferProcedureOutput<typeof endMembershipProcedure>
const endMembershipProcedure = procedure
  .input(z.object({ groupId: GroupMembershipSchema.shape.groupId, userId: GroupMembershipSchema.shape.userId }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.groupId)

    await ctx.addAuthorizationGuard(hasGroupManagerAccess(group), input)

    const endedMemberships = await ctx.groupService.endMembership(ctx.handle, input.userId, input.groupId)
    const user = await ctx.userService.getById(ctx.handle, input.userId)

    ctx.setAuditTransactionName(
      `End GroupMemberships for User(ID=${user.id},Name=${user.name}) in Group(Slug=${input.groupId},Name=${group.name})`
    )

    return endedMemberships
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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getByGroupMembershipId(ctx.handle, input.id)
    await ctx.addAuthorizationGuard(hasGroupManagerAccess(group), input)
    if (input.data.groupId !== group.slug) {
      const destination = await ctx.groupService.getBySlug(ctx.handle, input.data.groupId)
      await ctx.addAuthorizationGuard(hasGroupManagerAccess(destination), input)
    }

    const updatedGroupMembership = await ctx.groupService.updateMembership(
      ctx.handle,
      input.id,
      input.data,
      new Set(input.roleIds)
    )

    const user = await ctx.userService.getById(ctx.handle, updatedGroupMembership.userId)

    ctx.setAuditTransactionName(
      `Update GroupMembership(ID=${input.id}) for User(ID=${user.id},Name=${user.name}) in Group(Slug=${group.slug},Name=${group.name})`
    )

    return updatedGroupMembership
  })

export type DeleteMembershipInput = inferProcedureInput<typeof deleteMembershipProcedure>
export type DeleteMembershipOutput = inferProcedureOutput<typeof deleteMembershipProcedure>
const deleteMembershipProcedure = procedure
  .input(z.object({ id: GroupMembershipSchema.shape.id, groupId: GroupMembershipSchema.shape.groupId }))
  .output(z.void())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const groupMembership = await ctx.groupService.getMembershipById(ctx.handle, input.id)
    const group = await ctx.groupService.getBySlug(ctx.handle, groupMembership.groupId)

    await ctx.addAuthorizationGuard(hasGroupAdministratorAccess(group), input)

    const user = await ctx.userService.getById(ctx.handle, groupMembership.userId)

    await ctx.groupService.deleteManyGroupMemberships(ctx.handle, [input.id])

    ctx.setAuditTransactionName(
      `Delete GroupMembership(ID=${input.id}) for User(ID=${user.id},Name=${user.name}) in Group(Slug=${group.slug},Name=${group.name})`
    )
  })

export type CreateRoleInput = inferProcedureInput<typeof createRoleProcedure>
export type CreateRoleOutput = inferProcedureOutput<typeof createRoleProcedure>
const createRoleProcedure = procedure
  .input(GroupRoleWriteSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.groupId)

    await ctx.addAuthorizationGuard(hasGroupManagerAccess(group), input)

    const createdRole = await ctx.groupService.createRole(ctx.handle, input)

    ctx.setAuditTransactionName(
      `Create GroupRole(ID=${createdRole.id},Name=${createdRole.name}) for Group(Slug=${group.slug},Name=${group.name})`
    )

    return createdRole
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
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getByGroupRoleId(ctx.handle, input.id)
    await ctx.addAuthorizationGuard(hasGroupManagerAccess(group), input)
    if (input.role.groupId !== group.slug) {
      const destination = await ctx.groupService.getBySlug(ctx.handle, input.role.groupId)
      await ctx.addAuthorizationGuard(hasGroupManagerAccess(destination), input)
    }

    const updatedRole = await ctx.groupService.updateRole(ctx.handle, input.id, input.role)

    ctx.setAuditTransactionName(
      `Update GroupRole(ID=${updatedRole.id},Name=${updatedRole.name}) for Group(Slug=${group.slug},Name=${group.name})`
    )

    return updatedRole
  })

export type DeleteRoleInput = inferProcedureInput<typeof deleteRoleProcedure>
export type DeleteRoleOutput = inferProcedureOutput<typeof deleteRoleProcedure>
const deleteRoleProcedure = procedure
  .input(GroupRoleSchema.shape.id)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getByGroupRoleId(ctx.handle, input)
    await ctx.addAuthorizationGuard(hasGroupManagerAccess(group), input)

    return ctx.groupService.deleteRole(ctx.handle, input)
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
  .use(withAuthorization(isCommitteeMember()))
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
  allMembershipsByUserId: allMembershipsByUserIdProcedure,
  startMembership: startMembershipProcedure,
  endMembership: endMembershipProcedure,
  updateMembership: updateMembershipProcedure,
  deleteGroupMembership: deleteMembershipProcedure,
  createRole: createRoleProcedure,
  updateRole: updateRoleProcedure,
  deleteRole: deleteRoleProcedure,
  createFileUpload: createFileUploadProcedure,
})
