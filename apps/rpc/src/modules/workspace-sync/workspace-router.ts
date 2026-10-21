import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import invariant from "tiny-invariant"
import z from "zod"
import { permitIf } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { CommitteeGroupSlug } from "../../permissions/principal"
import {
  canCreateWorkspaceGroup,
  canCreateWorkspaceUser,
  canFindWorkspaceGroup,
  canFindWorkspaceUser,
  canGetWorkspaceGroupMembers,
  canGetWorkspaceGroupsForUser,
  canLinkWorkspaceGroup,
  canLinkWorkspaceUser,
  canResetWorkspaceUserPassword,
  canSynchronizeWorkspaceGroup,
} from "../../permissions/workspace-permissions"
import { procedure, t } from "../../trpc"
import { GroupSchema } from "../group/group"
import { UserSchema } from "../user/user"
import {
  WorkspaceGroupLinkSchema,
  WorkspaceGroupSchema,
  WorkspaceMemberLinkSchema,
  WorkspaceUserSchema,
} from "./workspace"

function hasCustomKey(customKey: string | undefined): boolean {
  return customKey != null && customKey !== ""
}

export type CreateWorkspaceUserInput = inferProcedureInput<typeof createWorkspaceUserProcedure>
export type CreateWorkspaceUserOutput = inferProcedureOutput<typeof createWorkspaceUserProcedure>
const createWorkspaceUserProcedure = procedure
  .input(
    z.object({
      userId: UserSchema.shape.id,
      contactCommittee: z.enum(Object.values(CommitteeGroupSlug) as [CommitteeGroupSlug, ...CommitteeGroupSlug[]]),
    })
  )
  .output(
    z.object({
      user: UserSchema,
      workspaceUser: WorkspaceUserSchema,
      recoveryCodes: z.array(z.string()).nullable(),
      password: z.string().nullable(),
    })
  )
  .use(withAuthentication())
  .use(
    withAuthorization(
      permitIf((principal, input) => canCreateWorkspaceUser(principal, input.userId, input.contactCommittee))
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    const createdWorkspaceUser = await workspaceService.createWorkspaceUser(
      ctx.handle,
      input.userId,
      input.contactCommittee
    )

    ctx.setAuditTransactionName(
      `Create WorkspaceUser for User(ID=${input.userId},Name=${createdWorkspaceUser.user.name})`
    )

    return createdWorkspaceUser
  })

export type FindWorkspaceUserInput = inferProcedureInput<typeof findWorkspaceUserProcedure>
export type FindWorkspaceUserOutput = inferProcedureOutput<typeof findWorkspaceUserProcedure>
const findWorkspaceUserProcedure = procedure
  .input(
    z.object({
      userId: UserSchema.shape.id,
      customKey: z.string().optional(),
    })
  )
  .output(WorkspaceUserSchema.nullable())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    await ctx.addAuthorizationGuard(
      permitIf((principal) => canFindWorkspaceUser(principal, input.userId, hasCustomKey(input.customKey))),
      input
    )

    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    return await workspaceService.findWorkspaceUser(ctx.handle, input.userId, input.customKey)
  })

export type LinkWorkspaceUserInput = inferProcedureInput<typeof linkWorkspaceUserProcedure>
export type LinkWorkspaceUserOutput = inferProcedureOutput<typeof linkWorkspaceUserProcedure>
const linkWorkspaceUserProcedure = procedure
  .input(
    z.object({
      userId: UserSchema.shape.id,
      customKey: z.string().optional(),
    })
  )
  .output(UserSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canLinkWorkspaceUser(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    const user = await ctx.userService.getById(ctx.handle, input.userId)
    const workspaceUser = await workspaceService.getWorkspaceUser(ctx.handle, input.userId, input.customKey)

    const updatedUser = await ctx.userService.update(ctx.handle, user.id, { workspaceUserId: workspaceUser.id })

    ctx.setAuditTransactionName(`Link WorkspaceUser for User(ID=${input.userId},Name=${updatedUser.name})`)

    return updatedUser
  })

export type LinkWorkspaceGroupInput = inferProcedureInput<typeof linkWorkspaceGroupProcedure>
export type LinkWorkspaceGroupOutput = inferProcedureOutput<typeof linkWorkspaceGroupProcedure>
const linkWorkspaceGroupProcedure = procedure
  .input(
    z.object({
      groupSlug: GroupSchema.shape.slug,
      customKey: z.string().optional(),
    })
  )
  .output(GroupSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canLinkWorkspaceGroup(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    const group = await ctx.groupService.getBySlug(ctx.handle, input.groupSlug)
    const workspaceGroup = await workspaceService.getWorkspaceGroup(ctx.handle, input.groupSlug, input.customKey)

    const updatedGroup = await ctx.groupService.update(ctx.handle, group.slug, { workspaceGroupId: workspaceGroup.id })

    ctx.setAuditTransactionName(`Link WorkspaceGroup for Group(Slug=${input.groupSlug},Name=${updatedGroup.name})`)

    return updatedGroup
  })

export type ResetWorkspaceUserPasswordInput = inferProcedureInput<typeof resetWorkspaceUserPasswordProcedure>
export type ResetWorkspaceUserPasswordOutput = inferProcedureOutput<typeof resetWorkspaceUserPasswordProcedure>
const resetWorkspaceUserPasswordProcedure = procedure
  .input(
    z.object({
      userId: UserSchema.shape.id,
    })
  )
  .output(
    z.object({
      user: UserSchema,
      workspaceUser: WorkspaceUserSchema,
      recoveryCodes: z.array(z.string()).nullable(),
      password: z.string(),
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal, input) => canResetWorkspaceUserPassword(principal, input.userId))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    const resetWorkspaceUser = await workspaceService.resetWorkspaceUserPassword(ctx.handle, input.userId)

    ctx.setAuditTransactionName(
      `Reset WorkspaceUser password for User(ID=${resetWorkspaceUser.user.id},Name=${resetWorkspaceUser.user.name})`
    )

    return resetWorkspaceUser
  })

export type CreateWorkspaceGroupInput = inferProcedureInput<typeof createWorkspaceGroupProcedure>
export type CreateWorkspaceGroupOutput = inferProcedureOutput<typeof createWorkspaceGroupProcedure>
const createWorkspaceGroupProcedure = procedure
  .input(
    z.object({
      groupSlug: GroupSchema.shape.slug,
    })
  )
  .output(WorkspaceGroupLinkSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canCreateWorkspaceGroup(principal))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    const createdWorkspaceGroup = await workspaceService.createWorkspaceGroup(ctx.handle, input.groupSlug)

    ctx.setAuditTransactionName(
      `Create WorkspaceGroup for Group(Slug=${input.groupSlug},Name=${createdWorkspaceGroup.group.name})`
    )

    return createdWorkspaceGroup
  })

export type FindWorkspaceGroupInput = inferProcedureInput<typeof findWorkspaceGroupProcedure>
export type FindWorkspaceGroupOutput = inferProcedureOutput<typeof findWorkspaceGroupProcedure>
const findWorkspaceGroupProcedure = procedure
  .input(
    z.object({
      groupSlug: GroupSchema.shape.slug,
      customKey: z.string().optional(),
    })
  )
  .output(WorkspaceGroupSchema.nullable())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    await ctx.addAuthorizationGuard(
      permitIf((principal) => canFindWorkspaceGroup(principal, input.groupSlug, hasCustomKey(input.customKey))),
      input
    )

    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    return await workspaceService.findWorkspaceGroup(ctx.handle, input.groupSlug, input.customKey)
  })

export type SynchronizeWorkspaceGroupInput = inferProcedureInput<typeof synchronizeWorkspaceGroupProcedure>
export type SynchronizeWorkspaceGroupOutput = inferProcedureOutput<typeof synchronizeWorkspaceGroupProcedure>
const synchronizeWorkspaceGroupProcedure = procedure
  .input(
    z.object({
      groupSlug: GroupSchema.shape.slug,
    })
  )
  .output(z.boolean())
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal, input) => canSynchronizeWorkspaceGroup(principal, input.groupSlug))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    const result = await workspaceService.synchronizeWorkspaceGroup(ctx.handle, input.groupSlug)

    const group = await ctx.groupService.getBySlug(ctx.handle, input.groupSlug)
    ctx.setAuditTransactionName(`Synchronize WorkspaceGroup for Group(Slug=${group.slug},Name=${group.name})`)

    return result
  })

export type GetMembersForWorkspaceGroupInput = inferProcedureInput<typeof getMembersForWorkspaceGroupProcedure>
export type GetMembersForWorkspaceGroupOutput = inferProcedureOutput<typeof getMembersForWorkspaceGroupProcedure>
const getMembersForWorkspaceGroupProcedure = procedure
  .input(
    z.object({
      groupSlug: GroupSchema.shape.slug,
    })
  )
  .output(WorkspaceMemberLinkSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal, input) => canGetWorkspaceGroupMembers(principal, input.groupSlug))))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    return await workspaceService.getMembersForGroup(ctx.handle, input.groupSlug)
  })

export type GetGroupsForWorkspaceUserInput = inferProcedureInput<typeof getGroupsForUserWorkspaceProcedure>
export type GetGroupsForWorkspaceUserOutput = inferProcedureOutput<typeof getGroupsForUserWorkspaceProcedure>
const getGroupsForUserWorkspaceProcedure = procedure
  .input(
    z.object({
      userId: UserSchema.shape.id,
    })
  )
  .output(WorkspaceGroupLinkSchema.array())
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal, input) => canGetWorkspaceGroupsForUser(principal, input.userId))))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    return await workspaceService.getWorkspaceGroupsForWorkspaceUser(ctx.handle, input.userId)
  })

export const workspaceRouter = t.router({
  createUser: createWorkspaceUserProcedure,
  findUser: findWorkspaceUserProcedure,
  linkUser: linkWorkspaceUserProcedure,
  linkGroup: linkWorkspaceGroupProcedure,
  resetPassword: resetWorkspaceUserPasswordProcedure,
  createGroup: createWorkspaceGroupProcedure,
  findGroup: findWorkspaceGroupProcedure,
  synchronizeGroup: synchronizeWorkspaceGroupProcedure,
  getMembersForGroup: getMembersForWorkspaceGroupProcedure,
  getGroupsForUser: getGroupsForUserWorkspaceProcedure,
})
