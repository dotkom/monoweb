import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { z } from "zod"
import { permitIf } from "../../authorization"
import { InvalidArgumentError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import {
  canCreateGroup,
  canCreateInterestGroupComment,
  canDeleteGroup,
  canManageGroupMembership,
  canManageGroupRoles,
  canUpdateGroup,
  canUploadGroupFiles,
} from "../../permissions/group-permissions"
import { CommitteeGroupSlug } from "../../permissions/principal"
import { procedure, t } from "../../trpc"
import {
  GroupByMemberFilterSchema,
  GroupMembershipSchema,
  GroupMembershipWriteSchema,
  GroupRoleSchema,
  GroupRoleWriteSchema,
  GroupSchema,
  GroupTypeSchema,
  GroupWriteSchema,
  InterestGroupCommentSchema,
  InterestGroupCommentWriteSchema,
  findActiveGroupMembershipIn,
} from "./group"

const createGroupProcedure = procedure
  .input(GroupWriteSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal, input) => canCreateGroup(principal, input.type))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const createdGroup = await ctx.groupService.create(ctx.handle, input)

    ctx.setAuditTransactionName(`Create Group(Slug=${createdGroup.slug},Name=${createdGroup.name})`)

    return createdGroup
  })

const allGroupsProcedure = procedure
  .input(z.object({ filter: z.object({ includeEmailGroups: z.boolean().optional() }).optional() }).optional())
  .query(async ({ ctx, input }) =>
    ctx.groupService.findMany(ctx.prisma, { includeEmailGroups: input?.filter?.includeEmailGroups ?? false })
  )

const allByTypeProcedure = procedure
  .input(GroupSchema.shape.type)
  .query(async ({ input, ctx }) => ctx.groupService.findManyByType(ctx.prisma, input))

const findGroupProcedure = procedure
  .input(GroupSchema.shape.slug)
  .query(async ({ input, ctx }) => ctx.groupService.findBySlug(ctx.prisma, input))

const getGroupProcedure = procedure
  .input(GroupSchema.shape.slug)
  .query(async ({ input, ctx }) => ctx.groupService.getBySlug(ctx.prisma, input))

const getByTypeProcedure = procedure
  .input(z.object({ groupId: GroupSchema.shape.slug, type: GroupSchema.shape.type }))
  .query(async ({ input, ctx }) => ctx.groupService.getBySlugAndType(ctx.prisma, input.groupId, input.type))

const updateGroupProcedure = procedure
  .input(
    z.object({
      id: GroupSchema.shape.slug,
      values: GroupWriteSchema.omit({ slug: true }),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.id)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canUpdateGroup(principal, group.slug, group.type, input.values.type)),
      input
    )

    const updatedGroup = await ctx.groupService.update(ctx.handle, input.id, input.values)

    ctx.setAuditTransactionName(`Update Group(Slug=${updatedGroup.slug},Name=${updatedGroup.name})`)

    return updatedGroup
  })

const deleteGroupProcedure = procedure
  .input(GroupSchema.shape.slug)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canDeleteGroup(principal, group.type)),
      input
    )

    const deletedGroup = await ctx.groupService.delete(ctx.handle, input)

    ctx.setAuditTransactionName(`Delete Group(Slug=${deletedGroup.slug},Name=${deletedGroup.name})`)

    return deletedGroup
  })

const getMembersProcedure = procedure.input(GroupSchema.shape.slug).query(async ({ input, ctx }) => {
  // We only show leaders of groups to unathenticated users, except for Hovedstyret who is public
  if (!ctx.principal && input !== CommitteeGroupSlug.HOVEDSTYRET) {
    return ctx.groupService.findLeadersBySlug(ctx.prisma, input)
  }
  return ctx.groupService.findMembersBySlug(ctx.prisma, input)
})

const getMemberProcedure = procedure
  .input(
    z.object({
      groupId: GroupSchema.shape.slug,
      userId: GroupMembershipSchema.shape.userId,
    })
  )
  .query(async ({ input, ctx }) => ctx.groupService.getMember(ctx.prisma, input.groupId, input.userId))

const allByMemberProcedure = procedure
  .input(
    z.object({
      userId: GroupMembershipSchema.shape.userId,
      filter: GroupByMemberFilterSchema.optional(),
    })
  )
  .query(async ({ input, ctx }) =>
    ctx.groupService.findManyByMemberUserId(ctx.prisma, input.userId, {
      includeEmailGroups: input.filter?.includeEmailGroups ?? false,
      includeEmailOnlyMemberships: input.filter?.includeEmailOnlyMemberships ?? false,
    })
  )

const allMembershipsByUserIdProcedure = procedure
  .input(GroupMembershipSchema.shape.userId)
  .use(withAuthentication())
  .query(async ({ input, ctx }) => ctx.groupService.allMembershipsByUserId(ctx.prisma, input))

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

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageGroupMembership(principal, group.slug, group.type)),
      input
    )

    const membership = await ctx.groupService.startMembership(
      ctx.handle,
      input.userId,
      input.groupId,
      new Set(input.roleIds)
    )
    const user = await ctx.userService.getById(ctx.handle, input.userId)

    ctx.setAuditTransactionName(
      `Start GroupMembership for User(ID=${user.id},Name=${user.name}) in Group(Slug=${input.groupId},Name=${group.name})`
    )

    return membership
  })

const endMembershipProcedure = procedure
  .input(z.object({ groupId: GroupMembershipSchema.shape.groupId, userId: GroupMembershipSchema.shape.userId }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.groupId)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageGroupMembership(principal, group.slug, group.type)),
      input
    )

    const endedMembership = await ctx.groupService.endMembership(ctx.handle, input.userId, input.groupId)
    const user = await ctx.userService.getById(ctx.handle, input.userId)

    ctx.setAuditTransactionName(
      `End GroupMembership for User(ID=${user.id},Name=${user.name}) in Group(Slug=${input.groupId},Name=${group.name})`
    )

    return endedMembership
  })

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

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageGroupMembership(principal, group.slug, group.type)),
      input
    )

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

const deleteMembershipProcedure = procedure
  .input(z.object({ id: GroupMembershipSchema.shape.id, groupId: GroupMembershipSchema.shape.groupId }))
  .output(z.void())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.groupId)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageGroupMembership(principal, group.slug, group.type)),
      input
    )

    const groupMembership = await ctx.groupService.getMembershipById(ctx.handle, input.id)
    const user = await ctx.userService.getById(ctx.handle, groupMembership.userId)

    await ctx.groupService.deleteManyGroupMemberships(ctx.handle, [input.id])

    ctx.setAuditTransactionName(
      `Delete GroupMembership(ID=${input.id}) for User(ID=${user.id},Name=${user.name}) in Group(Slug=${group.slug},Name=${group.name})`
    )
  })

const createRoleProcedure = procedure
  .input(GroupRoleWriteSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.groupId)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageGroupRoles(principal, group.slug, group.type)),
      input
    )

    const createdRole = await ctx.groupService.createRole(ctx.handle, input)

    ctx.setAuditTransactionName(
      `Create GroupRole(ID=${createdRole.id},Name=${createdRole.name}) for Group(Slug=${group.slug},Name=${group.name})`
    )

    return createdRole
  })

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

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageGroupRoles(principal, group.slug, group.type)),
      input
    )

    const updatedRole = await ctx.groupService.updateRole(ctx.handle, input.id, input.role)

    ctx.setAuditTransactionName(
      `Update GroupRole(ID=${updatedRole.id},Name=${updatedRole.name}) for Group(Slug=${group.slug},Name=${group.name})`
    )

    return updatedRole
  })

const deleteRoleProcedure = procedure
  .input(GroupRoleSchema.shape.id)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getByGroupRoleId(ctx.handle, input)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageGroupRoles(principal, group.slug, group.type)),
      input
    )

    return ctx.groupService.deleteRole(ctx.handle, input)
  })

const createFileUploadProcedure = procedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
    })
  )
  .output(z.custom<PresignedPost>())
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canUploadGroupFiles)))
  .mutation(async ({ input, ctx }) => {
    return ctx.groupService.createFileUpload(input.filename, input.contentType, ctx.principal.subject)
  })

const startInterestGroupMembershipProcedure = procedure
  .input(GroupSchema.shape.slug)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input)
    if (group.type !== GroupTypeSchema.enum.INTEREST_GROUP) {
      throw new InvalidArgumentError(`Group(Slug=${input}) is not an interest group`)
    }

    const userId = ctx.principal.subject
    const memberships = await ctx.groupService.allMembershipsByUserId(ctx.handle, userId)
    const activeMembership = findActiveGroupMembershipIn(memberships, input)

    if (activeMembership !== null) {
      return activeMembership
    }

    const membership = await ctx.groupService.startMembership(ctx.handle, userId, input)
    const user = await ctx.userService.getById(ctx.handle, userId)

    ctx.setAuditTransactionName(
      `Start GroupMembership for User(ID=${user.id},Name=${user.name}) in Group(Slug=${input},Name=${group.name})`
    )

    return membership
  })

const endInterestGroupMembershipProcedure = procedure
  .input(GroupSchema.shape.slug)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input)
    const userId = ctx.principal.subject
    const user = await ctx.userService.getById(ctx.handle, userId)
    const endedMembership = await ctx.groupService.endInterestGroupMembership(ctx.handle, userId, input)

    ctx.setAuditTransactionName(
      `End GroupMembership for User(ID=${user.id},Name=${user.name}) in Group(Slug=${input},Name=${group.name})`
    )

    return endedMembership
  })

const createInterestGroupCommentProcedure = procedure
  .input(z.object({ interestGroupId: GroupSchema.shape.slug, data: InterestGroupCommentWriteSchema }))
  .output(InterestGroupCommentSchema)
  .use(withAuthentication())
  .use(
    withAuthorization(permitIf((principal, input) => canCreateInterestGroupComment(principal, input.interestGroupId)))
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const group = await ctx.groupService.getBySlug(ctx.handle, input.interestGroupId)
    const user = await ctx.userService.getById(ctx.handle, ctx.principal.subject)
    const comment = await ctx.groupService.createInterestGroupComment(
      ctx.handle,
      input.interestGroupId,
      input.data,
      ctx.principal.subject
    )

    ctx.setAuditTransactionName(
      `Create InterestGroupComment for Group(Slug=${input.interestGroupId},Name=${group.name}) by User(ID=${user.id},Name=${user.name})`
    )

    return comment
  })

const findManyInterestGroupCommentsProcedure = procedure
  .input(GroupSchema.shape.slug)
  .output(InterestGroupCommentSchema.array())
  .use(withAuthentication())
  .query(async ({ input, ctx }) => {
    return ctx.groupService.findManyInterestGroupComments(ctx.prisma, input)
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
  startInterestGroupMembership: startInterestGroupMembershipProcedure,
  endInterestGroupMembership: endInterestGroupMembershipProcedure,
  createInterestGroupComment: createInterestGroupCommentProcedure,
  findManyInterestGroupComments: findManyInterestGroupCommentsProcedure,
})
