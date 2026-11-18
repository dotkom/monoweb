import { PaginateInputSchema } from "@dotkomonline/utils"
import { z } from "zod"
import { permitIf } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { canManageMark, canViewUserPersonalMarks } from "../../permissions/mark-permissions"
import { procedure, t } from "../../trpc"
import { UserSchema } from "../user/user"
import { CreatePersonalMarkSchema, PersonalMarkSchema } from "./mark"

const getPersonalMarksByUserProcedure = procedure
  .input(z.object({ userId: UserSchema.shape.id }))
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal, input) => canViewUserPersonalMarks(principal, input.userId))))
  .query(async ({ input, ctx }) => {
    return ctx.personalMarkService.findMarksByUserId(ctx.prisma, input.userId)
  })

const getVisibleInformationProcedure = procedure
  .input(z.object({ userId: UserSchema.shape.id, paginate: PaginateInputSchema }))
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal, input) => canViewUserPersonalMarks(principal, input.userId))))
  .query(async ({ ctx, input }) => {
    return ctx.personalMarkService.listVisibleInformationForUser(ctx.prisma, input.userId)
  })

const getPersonalMarksByMarkProcedure = procedure
  .input(z.object({ markId: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
  .use(withAuthentication())
  .query(async ({ input, ctx }) => {
    const mark = await ctx.markService.getById(ctx.prisma, input.markId)
    const groupIds = mark.groups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageMark(principal, groupIds)),
      input
    )

    // TODO: why is this using find?
    return ctx.personalMarkService.findPersonalMarksByMarkId(ctx.prisma, input.markId)
  })

const getPersonalMarkDetailsByMarkProcedure = procedure
  .input(z.object({ markId: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
  .use(withAuthentication())
  .query(async ({ input, ctx }) => {
    const mark = await ctx.markService.getById(ctx.prisma, input.markId)
    const groupIds = mark.groups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageMark(principal, groupIds)),
      input
    )

    return ctx.personalMarkService.findPersonalMarkDetails(ctx.prisma, input.markId)
  })

const addPersonalMarkToUserProcedure = procedure
  .input(CreatePersonalMarkSchema)
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const mark = await ctx.markService.getById(ctx.handle, input.markId)
    const groupIds = mark.groups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageMark(principal, groupIds)),
      input
    )

    const addedPersonalMark = await ctx.personalMarkService.addToUser(
      ctx.handle,
      input.userId,
      input.markId,
      ctx.principal.subject
    )
    const user = await ctx.userService.getById(ctx.handle, input.userId)

    ctx.setAuditTransactionName(
      `Add PersonalMark for Mark(ID=${addedPersonalMark.markId},Title=${mark.title}) to User(ID=${user.id},Name=${user.name})`
    )

    return addedPersonalMark
  })

const countUsersWithMarkProcedure = procedure
  .input(z.object({ markId: PersonalMarkSchema.shape.markId }))
  .use(withAuthentication())
  .query(async ({ input, ctx }) => {
    const mark = await ctx.markService.getById(ctx.prisma, input.markId)
    const groupIds = mark.groups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageMark(principal, groupIds)),
      input
    )

    return ctx.personalMarkService.countUsersByMarkId(ctx.prisma, input.markId)
  })

const removePersonalMarkFromUserProcedure = procedure
  .input(PersonalMarkSchema.pick({ userId: true, markId: true }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const mark = await ctx.markService.getById(ctx.handle, input.markId)
    const groupIds = mark.groups.map((group) => group.slug)

    await ctx.addAuthorizationGuard(
      permitIf((principal) => canManageMark(principal, groupIds)),
      input
    )

    const removedPersonalMark = await ctx.personalMarkService.removeFromUser(ctx.handle, input.userId, input.markId)
    const user = await ctx.userService.getById(ctx.handle, input.userId)

    ctx.setAuditTransactionName(
      `Remove PersonalMark for Mark(ID=${removedPersonalMark.markId},Title=${mark.title}) from User(ID=${user.id},Name=${user.name})`
    )

    return removedPersonalMark
  })

const getExpiryDateForUserProcedure = procedure
  .input(z.object({ userId: UserSchema.shape.id }))
  .use(withAuthentication())
  .use(withAuthorization(permitIf((principal, input) => canViewUserPersonalMarks(principal, input.userId))))
  .query(async ({ input, ctx }) => {
    return ctx.personalMarkService.findPunishmentByUserId(ctx.prisma, input.userId)
  })

export const personalMarkRouter = t.router({
  getByUser: getPersonalMarksByUserProcedure,
  getVisibleInformation: getVisibleInformationProcedure,
  getByMark: getPersonalMarksByMarkProcedure,
  getPersonalMarkDetailsByMark: getPersonalMarkDetailsByMarkProcedure,
  addToUser: addPersonalMarkToUserProcedure,
  countUsersWithMark: countUsersWithMarkProcedure,
  removeFromUser: removePersonalMarkFromUserProcedure,
  getExpiryDateForUser: getExpiryDateForUserProcedure,
})
