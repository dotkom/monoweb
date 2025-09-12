import { GroupSchema, UserSchema } from "@dotkomonline/types"
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
      const affiliations: Affiliation[] = ["dotkom", "hs"]
      if (isAffiliation(input.groupSlug)) {
        affiliations.push(input.groupSlug)
      }
      ctx.authorize.requireAffiliation(...affiliations)

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
      const affiliations: Affiliation[] = ["dotkom", "hs"]
      if (isAffiliation(input.groupSlug)) {
        affiliations.push(input.groupSlug)
      }
      ctx.authorize.requireAffiliation(...affiliations)

      return ctx.executeTransaction(async (handle) => {
        return await ctx.workspaceService.addUserIntoWorkspaceGroup(handle, input.groupSlug, input.userId)
      })
    }),

  removeUserfromGroup: staffProcedure
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
          user: UserSchema.nullable(),
          workspaceMember: z.custom<admin_directory_v1.Schema$Member>().nullable(),
        })
        .array()
    )
    .query(async ({ input, ctx }) => {
      const affiliations: Affiliation[] = ["dotkom", "hs"]
      if (isAffiliation(input.groupSlug)) {
        affiliations.push(input.groupSlug)
      }
      ctx.authorize.requireAffiliation(...affiliations)

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
