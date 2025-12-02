import {
  GroupSchema,
  UserSchema,
  WorkspaceGroupLinkSchema,
  WorkspaceGroupSchema,
  WorkspaceMemberLinkSchema,
  WorkspaceUserSchema,
} from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import invariant from "tiny-invariant"
import z from "zod"
import { isAdministrator, isGroupMember, isSameSubject, or } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"

export type CreateWorkspaceUserInput = inferProcedureInput<typeof createWorkspaceUserProcedure>
export type CreateWorkspaceUserOutput = inferProcedureOutput<typeof createWorkspaceUserProcedure>
const createWorkspaceUserProcedure = procedure
  .input(z.object({ userId: UserSchema.shape.id }))
  .output(
    z.object({
      user: UserSchema,
      workspaceUser: WorkspaceUserSchema,
      recoveryCodes: z.array(z.string()).nullable(),
      password: z.string(),
    })
  )
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isSameSubject((i) => i.userId)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")
    return await workspaceService.createWorkspaceUser(ctx.handle, input.userId)
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
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isSameSubject((i) => i.userId)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    // If the user inputs a custom key, we do not allow the userId as editor role because customKey will take
    // precedence and thus the user could potentially input any user.
    if (input.customKey) {
      await ctx.addAuthorizationGuard(isAdministrator(), input)
    }

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
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    const user = await ctx.userService.getById(ctx.handle, input.userId)
    const workspaceUser = await workspaceService.getWorkspaceUser(ctx.handle, input.userId, input.customKey)

    return await ctx.userService.update(ctx.handle, user.id, { workspaceUserId: workspaceUser.id })
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
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isGroupMember((i) => i.groupSlug)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    // If the user inputs a custom key, we do not allow the groupSlug as editor role because customKey will take
    // precedence and thus the user could potentially input any group.
    if (input.customKey) {
      await ctx.addAuthorizationGuard(isAdministrator(), input)
    }

    const group = await ctx.groupService.getBySlug(ctx.handle, input.groupSlug)
    const workspaceGroup = await workspaceService.getWorkspaceGroup(ctx.handle, input.groupSlug, input.customKey)

    return await ctx.groupService.update(ctx.handle, group.slug, { workspaceGroupId: workspaceGroup.id })
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
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isSameSubject((i) => i.userId)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")
    return await workspaceService.resetWorkspaceUserPassword(ctx.handle, input.userId)
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
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    return await workspaceService.createWorkspaceGroup(ctx.handle, input.groupSlug)
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
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isGroupMember((i) => i.groupSlug)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .query(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    // If the user inputs a custom key, we do not allow the groupSlug as editor role because customKey will take
    // precedence and thus the user could potentially input any group.
    if (input.customKey) {
      await ctx.addAuthorizationGuard(isAdministrator(), input)
    }
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
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const workspaceService = ctx.workspaceService
    invariant(workspaceService, "Workspace service is not available")

    return await workspaceService.synchronizeWorkspaceGroup(ctx.handle, input.groupSlug)
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
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isGroupMember((i) => i.groupSlug)
      )
    )
  )
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
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isSameSubject((i) => i.userId)
      )
    )
  )
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
