import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import {
  MembershipSchema,
  MembershipWriteSchema,
  UserFilterQuerySchema,
  UserSchema,
  UserWriteSchema,
} from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isAdministrator } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { BasePaginateInputSchema } from "../../query"
import { authenticatedProcedure, procedure, t } from "../../trpc"

export type AllUsersInput = inferProcedureInput<typeof allUsersProcedure>
export type AllUsersOutput = inferProcedureOutput<typeof allUsersProcedure>
const allUsersProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: UserFilterQuerySchema.optional() }))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const items = await ctx.userService.findUsers(ctx.handle, { ...input.filter }, input)
    return {
      items,
      nextCursor: items.at(-1)?.id,
    }
  })

export type GetUserInput = inferProcedureInput<typeof getUserProcedure>
export type GetUserOutput = inferProcedureOutput<typeof getUserProcedure>
const getUserProcedure = procedure
  .input(UserSchema.shape.id)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.userService.getById(ctx.handle, input)
  })

export type GetUserByProfileSlugInput = inferProcedureInput<typeof getUserByProfileSlugProcedure>
export type GetUserByProfileSlugOutput = inferProcedureOutput<typeof getUserByProfileSlugProcedure>
const getUserByProfileSlugProcedure = procedure
  .input(UserSchema.shape.profileSlug)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.userService.getByProfileSlug(ctx.handle, input)
  })

export type FindUserByProfileSlugInput = inferProcedureInput<typeof findUserByProfileSlugProcedure>
export type FindUserByProfileSlugOutput = inferProcedureOutput<typeof findUserByProfileSlugProcedure>
const findUserByProfileSlugProcedure = procedure
  .input(UserSchema.shape.profileSlug)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.userService.findByProfileSlug(ctx.handle, input)
  })

export type CreateUserFileUploadInput = inferProcedureInput<typeof createUserFileUploadProcedure>
export type CreateUserFileUploadOutput = inferProcedureOutput<typeof createUserFileUploadProcedure>
const createUserFileUploadProcedure = authenticatedProcedure
  .input(
    z.object({
      filename: z.string(),
      contentType: z.string(),
      userId: UserSchema.shape.id.optional(),
    })
  )
  .output(z.custom<PresignedPost>())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const userId = input?.userId ?? ctx.principal.subject

    ctx.authorize.requireMeOrEditorRole(userId, ctx.authorize.ADMIN_EDITOR_ROLES)

    return await ctx.userService.createFileUpload(
      ctx.handle,
      input.filename,
      input.contentType,
      userId,
      ctx.principal.subject
    )
  })

export type RegisterUserInput = inferProcedureInput<typeof registerUserProcedure>
export type RegisterUserOutput = inferProcedureOutput<typeof registerUserProcedure>
// NOTE: This procedure has no audit log entries, because the procedure is anonymous.
const registerUserProcedure = procedure
  .input(UserSchema.shape.id)
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    return ctx.userService.register(ctx.handle, input)
  })

export type CreateUserMembershipInput = inferProcedureInput<typeof createUserMembershipProcedure>
export type CreateUserMembershipOutput = inferProcedureOutput<typeof createUserMembershipProcedure>
const createUserMembershipProcedure = procedure
  .input(
    z.object({
      userId: UserSchema.shape.id,
      data: MembershipWriteSchema,
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.userService.createMembership(ctx.handle, input.userId, input.data)
  })

export type UpdateUserMembershipInput = inferProcedureInput<typeof updateUserMembershipProcedure>
export type UpdateUserMembershipOutput = inferProcedureOutput<typeof updateUserMembershipProcedure>
const updateUserMembershipProcedure = procedure
  .input(
    z.object({
      membershipId: MembershipSchema.shape.id,
      data: MembershipWriteSchema,
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.userService.updateMembership(ctx.handle, input.membershipId, input.data)
  })

export type DeleteUserMembershipInput = inferProcedureInput<typeof deleteUserMembershipProcedure>
export type DeleteUserMembershipOutput = inferProcedureOutput<typeof deleteUserMembershipProcedure>
const deleteUserMembershipProcedure = procedure
  .input(
    z.object({
      membershipId: MembershipSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.userService.deleteMembership(ctx.handle, input.membershipId)
  })

export type GetMeInput = inferProcedureInput<typeof getMeProcedure>
export type GetMeOutput = inferProcedureOutput<typeof getMeProcedure>
const getMeProcedure = authenticatedProcedure
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ ctx }) => {
    return ctx.userService.getById(ctx.handle, ctx.principal.subject)
  })

export type FindMeInput = inferProcedureInput<typeof findMeProcedure>
export type FindMeOutput = inferProcedureOutput<typeof findMeProcedure>
const findMeProcedure = procedure.use(withDatabaseTransaction()).query(async ({ ctx }) => {
  if (!ctx?.principal?.subject) {
    return null
  }
  return ctx.userService.findById(ctx.handle, ctx.principal.subject)
})

export type UpdateUserInput = inferProcedureInput<typeof updateUserProcedure>
export type UpdateUserOutput = inferProcedureOutput<typeof updateUserProcedure>
const updateUserProcedure = authenticatedProcedure
  .input(
    z.object({
      id: UserSchema.shape.id,
      input: UserWriteSchema.partial(),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    ctx.authorize.requireMeOrEditorRole(input.id, ctx.authorize.ADMIN_EDITOR_ROLES)

    let { name, ...data } = input.input

    // Only admins can change the name field
    if (!ctx.principal.editorRoles.has("dotkom") && !ctx.principal.editorRoles.has("hs")) {
      name = undefined
    }

    return ctx.userService.update(ctx.handle, input.id, { name, ...data })
  })

export type IsStaffInput = inferProcedureInput<typeof isStaffProcedure>
export type IsStaffOutput = inferProcedureOutput<typeof isStaffProcedure>
const isStaffProcedure = procedure.use(withDatabaseTransaction()).query(async ({ ctx }) => {
  try {
    ctx.authorize.requireEditorRole()
    return true
  } catch {
    return false
  }
})

export type IsAdminInput = inferProcedureInput<typeof isAdminProcedure>
export type IsAdminOutput = inferProcedureOutput<typeof isAdminProcedure>
const isAdminProcedure = procedure.use(withDatabaseTransaction()).query(async ({ ctx }) => {
  try {
    ctx.authorize.requireEditorRole(...ctx.authorize.ADMIN_EDITOR_ROLES)
    return true
  } catch {
    return false
  }
})

export const userRouter = t.router({
  all: allUsersProcedure,
  get: getUserProcedure,
  getByProfileSlug: getUserByProfileSlugProcedure,
  findByProfileSlug: findUserByProfileSlugProcedure,
  createFileUpload: createUserFileUploadProcedure,
  register: registerUserProcedure,
  createMembership: createUserMembershipProcedure,
  updateMembership: updateUserMembershipProcedure,
  deleteMembership: deleteUserMembershipProcedure,
  getMe: getMeProcedure,
  findMe: findMeProcedure,
  update: updateUserProcedure,
  isStaff: isStaffProcedure,
  isAdmin: isAdminProcedure,
})
