import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import {
  MembershipSchema,
  MembershipWriteSchema,
  UserFilterQuerySchema,
  UserSchema,
  UserWriteSchema,
} from "@dotkomonline/types"
import { BasePaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isAdministrator, isCommitteeMember, isSameSubject, or } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { InvalidArgumentError } from "../../error"

export type AllUsersInput = inferProcedureInput<typeof allUsersProcedure>
export type AllUsersOutput = inferProcedureOutput<typeof allUsersProcedure>
const allUsersProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: UserFilterQuerySchema.optional() }))
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
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
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isCommitteeMember(),
        isSameSubject((i) => i)
      )
    )
  )
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.userService.getById(ctx.handle, input)
  })

export type GetUserByUsernameInput = inferProcedureInput<typeof getUserByUsernameProcedure>
export type GetUserByUsernameOutput = inferProcedureOutput<typeof getUserByUsernameProcedure>
const getUserByUsernameProcedure = procedure
  .input(UserSchema.shape.username)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.userService.getByUsername(ctx.handle, input)
  })

export type FindUserByUsernameInput = inferProcedureInput<typeof findUserByUsernameProcedure>
export type FindUserByUsernameOutput = inferProcedureOutput<typeof findUserByUsernameProcedure>
const findUserByUsernameProcedure = procedure
  .input(UserSchema.shape.username)
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.userService.findByUsername(ctx.handle, input)
  })

export type CreateUserFileUploadInput = inferProcedureInput<typeof createUserFileUploadProcedure>
export type CreateUserFileUploadOutput = inferProcedureOutput<typeof createUserFileUploadProcedure>
const createUserFileUploadProcedure = procedure
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

    await ctx.addAuthorizationGuard(
      or(
        isAdministrator(),
        isSameSubject(() => userId)
      ),
      input
    )

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
  .use(withAuthorization(isAdministrator()))
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
  .use(withAuthorization(isAdministrator()))
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
const getMeProcedure = procedure
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
const updateUserProcedure = procedure
  .input(
    z.object({
      id: UserSchema.shape.id,
      input: UserWriteSchema.partial(),
    })
  )
  .use(withAuthentication())
  .use(
    withAuthorization(
      or(
        isAdministrator(),
        isSameSubject((i) => i.id)
      )
    )
  )
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    let { name, email, ...data } = input.input

    // Only admins can change the name and email fields
    if (!ctx.authorizationService.isAdministrator(ctx.principal.affiliations)) {
      name = undefined
      email = undefined
    }

    return ctx.userService.update(ctx.handle, input.id, { name, email, ...data })
  })

export type IsStaffInput = inferProcedureInput<typeof isStaffProcedure>
export type IsStaffOutput = inferProcedureOutput<typeof isStaffProcedure>
const isStaffProcedure = procedure.query(async ({ ctx }) => {
  const principal = ctx.principal
  if (principal === null) {
    return false
  }
  return ctx.authorizationService.isCommitteeMember(principal.affiliations)
})

export type IsAdminInput = inferProcedureInput<typeof isAdminProcedure>
export type IsAdminOutput = inferProcedureOutput<typeof isAdminProcedure>
const isAdminProcedure = procedure.query(async ({ ctx }) => {
  const principal = ctx.principal
  if (principal === null) {
    return false
  }
  return ctx.authorizationService.isAdministrator(principal.affiliations)
})

export type ConfirmIdentityLinkInput = inferProcedureInput<typeof confirmIdentityLinkProcedure>
export type ConfirmIdentityLinkOutput = inferProcedureOutput<typeof confirmIdentityLinkProcedure>
const confirmIdentityLinkProcedure = procedure
  .input(
    z.object({
      secondaryIdToken: z.string().min(1),
      secondaryUserId: UserSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const primaryUserId = ctx.principal.subject

    if (primaryUserId === input.secondaryUserId) {
      throw new InvalidArgumentError("Cannot link a user to themselves")
    }

    await ctx.userService.linkAuth0IdentitiesWithToken(primaryUserId, input.secondaryIdToken)

    return ctx.userService.mergeUsers(ctx.handle, primaryUserId, input.secondaryUserId)
  })

export type MergeUsersInput = inferProcedureInput<typeof mergeUsersProcedure>
export type MergeUsersOutput = inferProcedureOutput<typeof mergeUsersProcedure>
const mergeUsersProcedure = procedure
  .input(
    z.object({
      survivorUserId: UserSchema.shape.id,
      consumedUserId: UserSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(isAdministrator()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    await ctx.userService.linkAuth0Identities(input.survivorUserId, input.consumedUserId)

    return ctx.userService.mergeUsers(ctx.handle, input.survivorUserId, input.consumedUserId)
  })

export type GetAuth0ConnectionsInput = inferProcedureInput<typeof getAuth0ConnectionsProcedure>
export type GetAuth0ConnectionsOutput = inferProcedureOutput<typeof getAuth0ConnectionsProcedure>
const getAuth0ConnectionsProcedure = procedure
  .input(z.object({ userId: UserSchema.shape.id }).optional())
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    const userId = input?.userId ?? ctx.principal.subject

    await ctx.addAuthorizationGuard(
      or(
        isAdministrator(),
        isSameSubject(() => userId)
      ),
      input
    )

    // We omit the identities array from the response, because it contains sensitive information like access tokens.
    const { identities, ...response } = await ctx.userService.getAuth0Connections(userId)

    return response
  })

export const userRouter = t.router({
  all: allUsersProcedure,
  get: getUserProcedure,
  getByUsername: getUserByUsernameProcedure,
  findByUsername: findUserByUsernameProcedure,
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
  confirmIdentityLink: confirmIdentityLinkProcedure,
  mergeUsers: mergeUsersProcedure,
  getAuth0Connections: getAuth0ConnectionsProcedure,
})
