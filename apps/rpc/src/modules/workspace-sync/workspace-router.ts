import {
  GroupSchema,
  UserSchema,
  WorkspaceGroupLinkSchema,
  WorkspaceGroupSchema,
  WorkspaceMemberLinkSchema,
  WorkspaceUserSchema,
} from "@dotkomonline/types"
import invariant from "tiny-invariant"
import z from "zod"
import { staffProcedure, t } from "../../trpc"
import type { EditorRole } from "../authorization-service"

export const workspaceRouter = t.router({
  createUser: staffProcedure
    .input(z.object({ userId: UserSchema.shape.id }))
    .output(
      z.object({
        user: UserSchema,
        workspaceUser: WorkspaceUserSchema,
        recoveryCodes: z.array(z.string()).nullable(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const workspaceService = ctx.workspaceService
      invariant(workspaceService, "Workspace service is not available")

      ctx.authorize.requireMeOrEditorRole(input.userId, ["dotkom", "hs"])

      return ctx.executeTransaction(async (handle) => {
        return await workspaceService.createWorkspaceUser(handle, input.userId)
      })
    }),

  findUser: staffProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
        customKey: z.string().optional(),
      })
    )
    .output(WorkspaceUserSchema.nullable())
    .query(async ({ input, ctx }) => {
      const workspaceService = ctx.workspaceService
      invariant(workspaceService, "Workspace service is not available")

      // If the user inputs a custom key, we do not allow the userId as editor role because customKey will take
      // precedence and thus the user could potentially input any user.
      if (input.customKey) {
        ctx.authorize.requireEditorRole("dotkom", "hs")
      } else {
        ctx.authorize.requireMeOrEditorRole(input.userId, ["dotkom", "hs"])
      }

      return ctx.executeTransaction(async (handle) => {
        return await workspaceService.findWorkspaceUser(handle, input.userId, input.customKey)
      })
    }),

  linkUser: staffProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
        customKey: z.string().optional(),
      })
    )
    .output(UserSchema)
    .mutation(async ({ input, ctx }) => {
      const workspaceService = ctx.workspaceService
      invariant(workspaceService, "Workspace service is not available")

      ctx.authorize.requireEditorRole("dotkom", "hs")

      return ctx.executeTransaction(async (handle) => {
        const user = await ctx.userService.getById(handle, input.userId)
        const workspaceUser = await workspaceService.getWorkspaceUser(handle, input.userId, input.customKey)

        return await ctx.userService.update(handle, user.id, { workspaceUserId: workspaceUser.id })
      })
    }),

  linkGroup: staffProcedure
    .input(
      z.object({
        groupSlug: GroupSchema.shape.slug,
        customKey: z.string().optional(),
      })
    )
    .output(GroupSchema)
    .mutation(async ({ input, ctx }) => {
      const workspaceService = ctx.workspaceService
      invariant(workspaceService, "Workspace service is not available")

      // If the user inputs a custom key, we do not allow the groupSlug as editor role because customKey will take
      // precedence and thus the user could potentially input any group.
      if (input.customKey) {
        ctx.authorize.requireEditorRole("dotkom", "hs")
      } else {
        // input.groupSlug is not necessarily an editor role, but requireEditorRole will ignore it if not
        ctx.authorize.requireEditorRole("dotkom", "hs", input.groupSlug as EditorRole)
      }

      return ctx.executeTransaction(async (handle) => {
        const group = await ctx.groupService.getBySlug(handle, input.groupSlug)
        const workspaceGroup = await workspaceService.getWorkspaceGroup(handle, input.groupSlug, input.customKey)

        return await ctx.groupService.update(handle, group.slug, { workspaceGroupId: workspaceGroup.id })
      })
    }),

  resetPassword: staffProcedure
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
    .mutation(async ({ input, ctx }) => {
      const workspaceService = ctx.workspaceService
      invariant(workspaceService, "Workspace service is not available")

      ctx.authorize.requireMeOrEditorRole(input.userId, ["dotkom", "hs"])

      return ctx.executeTransaction(async (handle) => {
        return await workspaceService.resetWorkspaceUserPassword(handle, input.userId)
      })
    }),

  createGroup: staffProcedure
    .input(
      z.object({
        groupSlug: GroupSchema.shape.slug,
      })
    )
    .output(WorkspaceGroupLinkSchema)
    .mutation(async ({ input, ctx }) => {
      const workspaceService = ctx.workspaceService
      invariant(workspaceService, "Workspace service is not available")

      ctx.authorize.requireEditorRole("dotkom", "hs")

      return ctx.executeTransaction(async (handle) => {
        return await workspaceService.createWorkspaceGroup(handle, input.groupSlug)
      })
    }),

  findGroup: staffProcedure
    .input(
      z.object({
        groupSlug: GroupSchema.shape.slug,
        customKey: z.string().optional(),
      })
    )
    .output(WorkspaceGroupSchema.nullable())
    .query(async ({ input, ctx }) => {
      const workspaceService = ctx.workspaceService
      invariant(workspaceService, "Workspace service is not available")

      // If the user inputs a custom key, we do not allow the groupSlug as editor role because customKey will take
      // precedence and thus the user could potentially input any group.
      if (input.customKey) {
        ctx.authorize.requireEditorRole("dotkom", "hs")
      } else {
        // input.groupSlug is not necessarily an editor role, but requireEditorRole will ignore it if not
        ctx.authorize.requireEditorRole("dotkom", "hs", input.groupSlug as EditorRole)
      }
      return ctx.executeTransaction(async (handle) => {
        return await workspaceService.findWorkspaceGroup(handle, input.groupSlug, input.customKey)
      })
    }),

  synchronizeGroup: staffProcedure
    .input(
      z.object({
        groupSlug: GroupSchema.shape.slug,
      })
    )
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      const workspaceService = ctx.workspaceService
      invariant(workspaceService, "Workspace service is not available")

      ctx.authorize.requireEditorRole("dotkom", "hs", input.groupSlug as EditorRole)

      return ctx.executeTransaction(async (handle) => {
        return await workspaceService.synchronizeWorkspaceGroup(handle, input.groupSlug)
      })
    }),

  getMembersForGroup: staffProcedure
    .input(
      z.object({
        groupSlug: GroupSchema.shape.slug,
      })
    )
    .output(WorkspaceMemberLinkSchema.array())
    .query(async ({ input, ctx }) => {
      const workspaceService = ctx.workspaceService
      invariant(workspaceService, "Workspace service is not available")

      // input.groupSlug is not necessarily an editor role, but requireEditorRole will ignore it if not
      ctx.authorize.requireEditorRole("dotkom", "hs", input.groupSlug as EditorRole)

      return ctx.executeTransaction(async (handle) => {
        return await workspaceService.getMembersForGroup(handle, input.groupSlug)
      })
    }),

  getGroupsForUser: staffProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
      })
    )
    .output(WorkspaceGroupLinkSchema.array())
    .query(async ({ input, ctx }) => {
      const workspaceService = ctx.workspaceService
      invariant(workspaceService, "Workspace service is not available")

      ctx.authorize.requireMeOrEditorRole(input.userId, ["dotkom", "hs"])

      return ctx.executeTransaction(async (handle) => {
        return await workspaceService.getWorkspaceGroupsForWorkspaceUser(handle, input.userId)
      })
    }),
})
