import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import {
  MembershipSchema,
  MembershipWriteSchema,
  UserFilterQuerySchema,
  UserSchema,
  UserWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { BasePaginateInputSchema } from "../../query"
import { authenticatedProcedure, procedure, staffProcedure, t } from "../../trpc"

export const userRouter = t.router({
  all: procedure
    .input(BasePaginateInputSchema.extend({ filter: UserFilterQuerySchema.optional() }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        const items = await ctx.userService.findUsers(handle, { ...input.filter }, input)

        return {
          items,
          nextCursor: items.at(-1)?.id,
        }
      })
    ),
  get: procedure.input(UserSchema.shape.id).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getById(handle, input)
    })
  ),
  getByProfileSlug: procedure.input(UserSchema.shape.profileSlug).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getByProfileSlug(handle, input)
    })
  ),
  findByProfileSlug: procedure.input(UserSchema.shape.profileSlug).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.findByProfileSlug(handle, input)
    })
  ),
  /**
   * Create a presigned AWS S3 URL for uploading an avatar image to our S3 bucket.
   */
  createFileUpload: authenticatedProcedure
    .input(
      z.object({
        filename: z.string(),
        contentType: z.string(),
        userId: UserSchema.shape.id.optional(),
      })
    )
    .output(z.custom<PresignedPost>())
    .mutation(async ({ input, ctx }) => {
      const userId = input?.userId ?? ctx.principal.subject

      ctx.authorize.requireMeOrEditorRole(userId, ctx.authorize.ADMIN_EDITOR_ROLES)

      return ctx.executeAuditedTransaction(async (handle) => {
        return await ctx.userService.createFileUpload(
          handle,
          input.filename,
          input.contentType,
          userId,
          ctx.principal.subject
        )
      })
    }),
  register: procedure.input(UserSchema.shape.id).mutation(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.register(handle, input)
    })
  ),
  createMembership: staffProcedure
    .input(
      z.object({
        userId: UserSchema.shape.id,
        data: MembershipWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) => {
        return ctx.userService.createMembership(handle, input.userId, input.data)
      })
    ),
  updateMembership: staffProcedure
    .input(
      z.object({
        membershipId: MembershipSchema.shape.id,
        data: MembershipWriteSchema,
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeAuditedTransaction(async (handle) => {
        return ctx.userService.updateMembership(handle, input.membershipId, input.data)
      })
    ),
  deleteMembership: staffProcedure
    .input(
      z.object({
        membershipId: MembershipSchema.shape.id,
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireEditorRole(...ctx.authorize.ADMIN_EDITOR_ROLES)
      return ctx.executeAuditedTransaction(async (handle) => {
        return ctx.userService.deleteMembership(handle, input.membershipId)
      })
    }),
  getMe: authenticatedProcedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getById(handle, ctx.principal.subject)
    })
  ),
  findMe: procedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => {
      if (!ctx?.principal?.subject) {
        return null
      }
      return ctx.userService.findById(handle, ctx.principal.subject)
    })
  ),
  update: authenticatedProcedure
    .input(
      z.object({
        id: UserSchema.shape.id,
        input: UserWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ctx.authorize.requireMeOrEditorRole(input.id, ctx.authorize.ADMIN_EDITOR_ROLES)

      let { name, ...data } = input.input

      // Only admins can change the name field
      if (!ctx.principal.editorRoles.has("dotkom") && !ctx.principal.editorRoles.has("hs")) {
        name = undefined
      }

      return ctx.executeAuditedTransaction(async (handle) => {
        return ctx.userService.update(handle, input.id, { name, ...data })
      })
    }),
  isStaff: procedure.query(async ({ ctx }) => {
    try {
      ctx.authorize.requireEditorRole()
      return true
    } catch {
      return false
    }
  }),
  isAdmin: procedure.query(async ({ ctx }) => {
    try {
      ctx.authorize.requireEditorRole(...ctx.authorize.ADMIN_EDITOR_ROLES)
      return true
    } catch {
      return false
    }
  }),
})
