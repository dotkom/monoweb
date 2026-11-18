import type { PresignedPost } from "@aws-sdk/s3-presigned-post"
import { BasePaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { permitIf } from "../../authorization"
import { InvalidArgumentError, UnauthorizedError } from "../../error"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import {
  canAdminMergeUsers,
  canEditUserNameAndEmail,
  canEditUserProfile,
  canListUsers,
  canManageUserMemberships,
} from "../../permissions/user-permissions"
import { procedure, t } from "../../trpc"
import { GroupRoleTypeSchema } from "../group/group"
import {
  BugReportFormSchema,
  MembershipSchema,
  MembershipWriteSchema,
  UserFilterQuerySchema,
  UserSchema,
  UserWriteSchema,
} from "./user"

const allUsersProcedure = procedure
  .input(BasePaginateInputSchema.extend({ filter: UserFilterQuerySchema.optional() }))
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal) => canListUsers(principal))))
  .query(async ({ input, ctx }) => {
    const items = await ctx.userService.findUsers(ctx.prisma, { ...input.filter }, input)

    return {
      items,
      nextCursor: items.at(-1)?.id,
    }
  })

const getUserProcedure = procedure
  .input(UserSchema.shape.id)
  .use(withAuthentication())
  .query(async ({ input, ctx }) => {
    return ctx.userService.getById(ctx.prisma, input)
  })

const getUserByUsernameProcedure = procedure
  .input(UserSchema.shape.username)
  .use(withAuthentication())
  .query(async ({ input, ctx }) => {
    return ctx.userService.getByUsername(ctx.prisma, input)
  })

const findUserByUsernameProcedure = procedure
  .input(UserSchema.shape.username)
  .use(withAuthentication())
  .query(async ({ input, ctx }) => {
    return ctx.userService.findByUsername(ctx.prisma, input)
  })

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
  .mutation(async ({ input, ctx }) => {
    const userId = input?.userId ?? ctx.principal.subject

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canEditUserProfile(principal, userId)),
      input
    )

    return await ctx.userService.createFileUpload(
      ctx.prisma,
      input.filename,
      input.contentType,
      userId,
      ctx.principal.subject
    )
  })

// NOTE: This procedure has no audit log entries, because the procedure is anonymous.
const registerUserProcedure = procedure
  .input(UserSchema.shape.id)
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    return ctx.userService.register(ctx.handle, input)
  })

const createUserMembershipProcedure = procedure
  .input(
    z.object({
      userId: UserSchema.shape.id,
      data: MembershipWriteSchema,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canManageUserMemberships)))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const user = await ctx.userService.createMembership(ctx.handle, input.userId, input.data)

    ctx.setAuditTransactionName(`Create Membership for User(ID=${user.id},Name=${user.name})`)

    return user
  })

const updateUserMembershipProcedure = procedure
  .input(
    z.object({
      membershipId: MembershipSchema.shape.id,
      data: MembershipWriteSchema,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canManageUserMemberships)))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const user = await ctx.userService.updateMembership(ctx.handle, input.membershipId, input.data)

    ctx.setAuditTransactionName(`Update Membership(ID=${input.membershipId}) for User(ID=${user.id},Name=${user.name})`)

    return user
  })

const deleteUserMembershipProcedure = procedure
  .input(
    z.object({
      membershipId: MembershipSchema.shape.id,
    })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canManageUserMemberships)))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const user = await ctx.userService.deleteMembership(ctx.handle, input.membershipId)

    ctx.setAuditTransactionName(`Delete Membership(ID=${input.membershipId}) for User(ID=${user.id},Name=${user.name})`)

    return user
  })

export type GetMeOutput = inferProcedureOutput<typeof getMeProcedure>
const getMeProcedure = procedure.use(withAuthentication()).query(async ({ ctx }) => {
  return ctx.userService.getById(ctx.prisma, ctx.principal.subject)
})

const findMeProcedure = procedure.query(async ({ ctx }) => {
  if (!ctx?.principal?.subject) {
    return null
  }

  return ctx.userService.findById(ctx.prisma, ctx.principal.subject)
})

const updateUserProcedure = procedure
  .input(
    z.object({
      id: UserSchema.shape.id,
      input: UserWriteSchema.partial(),
    })
  )
  .output(UserSchema)
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal, input) => canEditUserProfile(principal, input.id))))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    let { name, email, ...data } = input.input

    if (!canEditUserNameAndEmail(ctx.principal, input.id)) {
      name = undefined
      email = undefined
    }

    const user = await ctx.userService.update(ctx.handle, input.id, { name, email, ...data })

    ctx.setAuditTransactionName(`Update User(ID=${user.id},Name=${user.name})`)

    return user
  })

const requestEmailChangeProcedure = procedure
  .input(z.object({ newEmail: z.email() }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const user = await ctx.userService.getById(ctx.handle, ctx.principal.subject)
    const result = await ctx.userService.requestEmailChange(ctx.handle, user.id, input.newEmail)

    ctx.setAuditTransactionName(`Request Email change for User(ID=${user.id},Name=${user.name})`)

    return result
  })

const syncEmailFromAuth0Procedure = procedure
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ ctx }) => {
    const user = await ctx.userService.getById(ctx.handle, ctx.principal.subject)
    const result = await ctx.userService.syncEmailFromAuth0(ctx.handle, user.id)

    ctx.setAuditTransactionName(`Sync email from Auth0 for User(ID=${user.id},Name=${user.name})`)

    return result
  })

const isStaffProcedure = procedure.query(async ({ ctx }) => {
  const principal = ctx.principal
  if (principal === null) {
    return false
  }

  return ctx.authorizationService.isCommitteeMember(principal.affiliations)
})

const isAdminProcedure = procedure.query(async ({ ctx }) => {
  const principal = ctx.principal
  if (principal === null) {
    return false
  }

  return ctx.authorizationService.isAdministrator(principal.affiliations)
})

const getAuthorizationProcedure = procedure
  .output(
    z.object({
      isAdministrator: z.boolean(),
      isCommitteeMember: z.boolean(),
      affiliations: z.record(z.string(), z.array(GroupRoleTypeSchema)),
    })
  )
  .query(async ({ ctx }) => {
    const principal = ctx.principal

    if (principal === null) {
      return {
        isAdministrator: false,
        isCommitteeMember: false,
        affiliations: {},
      }
    }

    const affiliations: Record<string, z.infer<typeof GroupRoleTypeSchema>[]> = {}

    for (const [groupId, roles] of principal.affiliations.entries()) {
      affiliations[groupId] = Array.from(roles)
    }

    return {
      isAdministrator: ctx.authorizationService.isAdministrator(principal.affiliations),
      isCommitteeMember: ctx.authorizationService.isCommitteeMember(principal.affiliations),
      affiliations,
    }
  })

const confirmIdentityLinkProcedure = procedure
  .input(
    z.object({
      secondaryIdToken: z.string().min(1),
    })
  )
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const primaryUserId = ctx.principal.subject

    const claims = await ctx.webJwtService.verify(input.secondaryIdToken).catch(() => null)

    if (claims === null) {
      throw new UnauthorizedError("Invalid secondary ID token")
    }

    const secondaryUserId = claims.payload.sub

    if (!secondaryUserId) {
      throw new UnauthorizedError("Secondary ID token has no sub claim")
    }

    if (primaryUserId === secondaryUserId) {
      throw new InvalidArgumentError("Cannot link a user to themselves")
    }

    const survivorUser = await ctx.userService.getById(ctx.handle, primaryUserId)
    const consumedUser = await ctx.userService.getById(ctx.handle, secondaryUserId)
    const result = await ctx.userMergeService.mergeAndLinkIdentities(ctx.handle, primaryUserId, secondaryUserId)

    ctx.setAuditTransactionName(
      `Merge and Link User(ID=${consumedUser.id},Name=${consumedUser.name}) into User(ID=${survivorUser.id},Name=${survivorUser.name})`
    )

    return result
  })

// IMPORTANT: It does not make sense to link Auth0 identities WITHOUT merging the database users, as the user will be
// orphaned and will not be accessible by authentication.
const mergeUsersProcedure = procedure
  .input(
    z
      .object({
        survivorUserId: UserSchema.shape.id,
        consumedUserId: UserSchema.shape.id,
        mergeInDatabase: z.boolean().default(true),
        linkAuth0Identities: z.boolean().default(true),
      })
      .refine((input) => input.mergeInDatabase || input.linkAuth0Identities, {
        path: ["mergeInDatabase"],
        error: "At least one of mergeInDatabase or linkAuth0Identities must be true",
      })
  )
  .use(withAuthentication())
  .use(withAuthorization(permitIf(canAdminMergeUsers)))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const { survivorUserId, consumedUserId, mergeInDatabase, linkAuth0Identities } = input
    const survivorUser = await ctx.userService.getById(ctx.handle, survivorUserId)
    const consumedUser = await ctx.userService.getById(ctx.handle, consumedUserId)

    if (linkAuth0Identities && mergeInDatabase) {
      const result = await ctx.userMergeService.mergeAndLinkIdentities(ctx.handle, survivorUserId, consumedUserId)

      ctx.setAuditTransactionName(
        `Merge and Link User(ID=${consumedUser.id},Name=${consumedUser.name}) into User(ID=${survivorUser.id},Name=${survivorUser.name})`
      )

      return result.user
    }

    if (linkAuth0Identities) {
      await ctx.userMergeService.linkAuth0Identities(survivorUserId, consumedUserId)

      ctx.setAuditTransactionName(
        `Link User(ID=${consumedUserId},Name=${consumedUser.name}) to User(ID=${survivorUserId},Name=${survivorUser.name})`
      )
    }

    const user = mergeInDatabase
      ? await ctx.userMergeService.merge(ctx.handle, survivorUserId, consumedUserId)
      : await ctx.userService.getById(ctx.handle, survivorUserId)

    if (!linkAuth0Identities && mergeInDatabase) {
      ctx.setAuditTransactionName(
        `Merge User(ID=${consumedUserId},Name=${consumedUser.name}) into User(ID=${survivorUserId},Name=${survivorUser.name})`
      )
    }

    return user
  })

const hasDuplicateUserProcedure = procedure
  .output(z.string().nullable())
  .use(withAuthentication())
  .query(async ({ ctx }) => {
    return ctx.userService.hasDuplicateUser(ctx.prisma, ctx.principal.subject)
  })

const getAuth0ConnectionsProcedure = procedure
  .input(z.object({ userId: UserSchema.shape.id }).optional())
  .use(withAuthentication())
  .query(async ({ input, ctx }) => {
    const userId = input?.userId ?? ctx.principal.subject

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canEditUserProfile(principal, userId)),
      input
    )

    // We omit the identities array from the response, because it contains sensitive information like access tokens.
    const { identities, ...response } = await ctx.userService.getAuth0Connections(userId)

    return response
  })

const sendBugReportEmailProcedure = procedure
  .input(BugReportFormSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .mutation(async ({ input, ctx }) => {
    await ctx.userService.sendBugReportEmail(ctx.handle, ctx.principal.subject, input)
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
  requestEmailChange: requestEmailChangeProcedure,
  syncEmailFromAuth0: syncEmailFromAuth0Procedure,
  isStaff: isStaffProcedure,
  isAdmin: isAdminProcedure,
  getAuthorization: getAuthorizationProcedure,
  confirmIdentityLink: confirmIdentityLinkProcedure,
  mergeUsers: mergeUsersProcedure,
  hasDuplicateUser: hasDuplicateUserProcedure,
  getAuth0Connections: getAuth0ConnectionsProcedure,
  sendBugReportEmail: sendBugReportEmailProcedure,
})
