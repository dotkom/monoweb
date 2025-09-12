import { GroupMemberSchema, GroupSchema, UserSchema } from "@dotkomonline/types"
import type { admin_directory_v1 } from "googleapis"
import z from "zod"
import { staffProcedure, t } from "../../trpc"
import { type Affiliation, isAffiliation } from "../authorization-service"

export const workspaceRouter = t.router({
  createUser: staffProcedure
    .input(z.object({ userId: UserSchema.shape.id }))
    .output(
      z.object({
        user: UserSchema,
        workspaceUser: z.custom<admin_directory_v1.Schema$User>(),
        recoveryCodes: z.array(z.string()).nullable(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireMeOrAffiliation(input.userId, ["dotkom", "hs"])

      return ctx.executeTransaction(async (handle) => {
        return await ctx.workspaceService.createWorkspaceUser(handle, input.userId)
      })
    }),

  findUser: staffProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
      })
    )
    .output(z.custom<admin_directory_v1.Schema$User>().nullable())
    .query(async ({ input, ctx }) => {
      ctx.authorize.requireMeOrAffiliation(input.userId, ["dotkom", "hs"])

      return ctx.executeTransaction(async (handle) => {
        return await ctx.workspaceService.findWorkspaceUser(handle, input.userId)
      })
    }),

  linkUser: staffProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
      })
    )
    .output(UserSchema)
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireMeOrAffiliation(input.userId, ["dotkom", "hs"])

      return ctx.executeTransaction(async (handle) => {
        const user = await ctx.userService.getById(handle, input.userId)
        const workspaceUser = await ctx.workspaceService.getWorkspaceUser(handle, input.userId)

        return await ctx.userService.update(handle, user.id, { workspaceUserId: workspaceUser.id })
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
        workspaceUser: z.custom<admin_directory_v1.Schema$User>(),
        recoveryCodes: z.array(z.string()).nullable(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireMeOrAffiliation(input.userId, ["dotkom", "hs"])

      return ctx.executeTransaction(async (handle) => {
        return await ctx.workspaceService.resetWorkspaceUserPassword(handle, input.userId)
      })
    }),

  createGroup: staffProcedure
    .input(
      z.object({
        groupSlug: GroupSchema.shape.slug,
      })
    )
    .output(
      z.object({
        group: GroupSchema,
        workspaceGroup: z.custom<admin_directory_v1.Schema$Group>(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireAffiliation("dotkom", "hs")

      return ctx.executeTransaction(async (handle) => {
        return await ctx.workspaceService.createWorkspaceGroup(handle, input.groupSlug)
      })
    }),

  findGroup: staffProcedure
    .input(
      z.object({
        groupSlug: GroupSchema.shape.slug,
      })
    )
    .output(z.custom<admin_directory_v1.Schema$Group>().nullable())
    .query(async ({ input, ctx }) => {
      // input.groupSlug is not necessarily an affiliation, but requireAffiliation will ignore it if not
      ctx.authorize.requireAffiliation("dotkom", "hs", input.groupSlug as Affiliation)

      return ctx.executeTransaction(async (handle) => {
        return await ctx.workspaceService.findWorkspaceGroup(handle, input.groupSlug)
      })
    }),

  addUserToGroup: staffProcedure
    .input(
      z.object({
        groupSlug: GroupSchema.shape.slug,
        userId: UserSchema.shape.id,
      })
    )
    .output(z.custom<admin_directory_v1.Schema$Group>().nullable())
    .mutation(async ({ input, ctx }) => {
      // input.groupSlug is not necessarily an affiliation, but requireAffiliation will ignore it if not
      ctx.authorize.requireAffiliation("dotkom", "hs", input.groupSlug as Affiliation)

      return ctx.executeTransaction(async (handle) => {
        return await ctx.workspaceService.addUserIntoWorkspaceGroup(handle, input.groupSlug, input.userId)
      })
    }),

  removeUserFromGroup: staffProcedure
    .input(
      z.object({
        groupSlug: GroupSchema.shape.slug,
        userId: UserSchema.shape.id,
      })
    )
    .output(z.boolean())
    .mutation(async ({ input, ctx }) => {
      const affiliations: Affiliation[] = ["dotkom", "hs"]
      if (isAffiliation(input.groupSlug)) {
        affiliations.push(input.groupSlug)
      }
      ctx.authorize.requireAffiliation(...affiliations)

      return ctx.executeTransaction(async (handle) => {
        return await ctx.workspaceService.removeUserFromWorkspaceGroup(handle, input.groupSlug, input.userId)
      })
    }),

  getMembersForGroup: staffProcedure
    .input(
      z.object({
        groupSlug: GroupSchema.shape.slug,
      })
    )
    .output(
      z
        .object({
          groupMember: GroupMemberSchema.nullable(),
          workspaceMember: z.custom<admin_directory_v1.Schema$Member>().nullable(),
        })
        .array()
    )
    .query(async ({ input, ctx }) => {
      // input.groupSlug is not necessarily an affiliation, but requireAffiliation will ignore it if not
      ctx.authorize.requireAffiliation("dotkom", "hs", input.groupSlug as Affiliation)

      return ctx.executeTransaction(async (handle) => {
        return await ctx.workspaceService.getMembersForGroup(handle, input.groupSlug)
      })
    }),

  getGroupsForUser: staffProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
      })
    )
    .output(
      z
        .object({
          group: GroupSchema,
          workspaceGroup: z.custom<admin_directory_v1.Schema$Group>(),
        })
        .array()
    )
    .query(async ({ input, ctx }) => {
      ctx.authorize.requireMeOrAffiliation(input.userId, ["dotkom", "hs"])

      return ctx.executeTransaction(async (handle) => {
        return await ctx.workspaceService.getWorkspaceGroupsForWorkspaceUser(handle, input.userId)
      })
    }),
})
