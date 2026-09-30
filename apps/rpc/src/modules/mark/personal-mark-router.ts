import { PaginateInputSchema } from "@dotkomonline/utils"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isAdministrator, isCommitteeMember, isSameSubject, or } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { procedure, t } from "../../trpc"
import { UserSchema } from "../user/user"
import { CreatePersonalMarkSchema, PersonalMarkSchema } from "./mark"

export type GetPersonalMarksByUserInput = inferProcedureInput<typeof getPersonalMarksByUserProcedure>
export type GetPersonalMarksByUserOutput = inferProcedureOutput<typeof getPersonalMarksByUserProcedure>
const getPersonalMarksByUserProcedure = procedure
  .input(z.object({ userId: UserSchema.shape.id }))
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
    return ctx.personalMarkService.findMarksByUserId(ctx.handle, input.userId)
  })

export type GetVisibleInformationInput = inferProcedureInput<typeof getVisibleInformationProcedure>
export type GetVisibleInformationOutput = inferProcedureOutput<typeof getVisibleInformationProcedure>
const getVisibleInformationProcedure = procedure
  .input(z.object({ userId: UserSchema.shape.id, paginate: PaginateInputSchema }))
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
  .query(async ({ ctx, input }) => {
    return ctx.personalMarkService.listVisibleInformationForUser(ctx.handle, input.userId)
  })

export type GetPersonalMarksByMarkInput = inferProcedureInput<typeof getPersonalMarksByMarkProcedure>
export type GetPersonalMarksByMarkOutput = inferProcedureOutput<typeof getPersonalMarksByMarkProcedure>
const getPersonalMarksByMarkProcedure = procedure
  .input(z.object({ markId: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.personalMarkService.findPersonalMarksByMarkId(ctx.handle, input.markId)
  })

export type GetPersonalMarkDetailsByMarkInput = inferProcedureInput<typeof getPersonalMarkDetailsByMarkProcedure>
export type GetPersonalMarkDetailsByMarkOutput = inferProcedureOutput<typeof getPersonalMarkDetailsByMarkProcedure>
const getPersonalMarkDetailsByMarkProcedure = procedure
  .input(z.object({ markId: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.personalMarkService.findPersonalMarkDetails(ctx.handle, input.markId)
  })

export type AddPersonalMarkToUserInput = inferProcedureInput<typeof addPersonalMarkToUserProcedure>
export type AddPersonalMarkToUserOutput = inferProcedureOutput<typeof addPersonalMarkToUserProcedure>
const addPersonalMarkToUserProcedure = procedure
  .input(CreatePersonalMarkSchema)
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const addedPersonalMark = await ctx.personalMarkService.addToUser(
      ctx.handle,
      input.userId,
      input.markId,
      ctx.principal.subject
    )
    const user = await ctx.userService.getById(ctx.handle, input.userId)

    const mark = await ctx.markService.getById(ctx.handle, addedPersonalMark.markId)

    ctx.setAuditTransactionName(
      `Add PersonalMark for Mark(ID=${addedPersonalMark.markId},Title=${mark.title}) to User(ID=${user.id},Name=${user.name})`
    )

    return addedPersonalMark
  })

export type CountUsersWithMarkInput = inferProcedureInput<typeof countUsersWithMarkProcedure>
export type CountUsersWithMarkOutput = inferProcedureOutput<typeof countUsersWithMarkProcedure>
const countUsersWithMarkProcedure = procedure
  .input(z.object({ markId: PersonalMarkSchema.shape.markId }))
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.personalMarkService.countUsersByMarkId(ctx.handle, input.markId)
  })

export type RemovePersonalMarkFromUserInput = inferProcedureInput<typeof removePersonalMarkFromUserProcedure>
export type RemovePersonalMarkFromUserOutput = inferProcedureOutput<typeof removePersonalMarkFromUserProcedure>
const removePersonalMarkFromUserProcedure = procedure
  .input(PersonalMarkSchema.pick({ userId: true, markId: true }))
  .use(withAuthentication())
  .use(withAuthorization(isCommitteeMember()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    const removedPersonalMark = await ctx.personalMarkService.removeFromUser(ctx.handle, input.userId, input.markId)
    const mark = await ctx.markService.getById(ctx.handle, removedPersonalMark.markId)
    const user = await ctx.userService.getById(ctx.handle, input.userId)

    ctx.setAuditTransactionName(
      `Remove PersonalMark for Mark(ID=${removedPersonalMark.markId},Title=${mark.title}) from User(ID=${user.id},Name=${user.name})`
    )

    return removedPersonalMark
  })

export type GetExpiryDateForUserInput = inferProcedureInput<typeof getExpiryDateForUserProcedure>
export type GetExpiryDateForUserOutput = inferProcedureOutput<typeof getExpiryDateForUserProcedure>
const getExpiryDateForUserProcedure = procedure
  .input(z.object({ userId: UserSchema.shape.id }))
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
    return ctx.personalMarkService.findPunishmentByUserId(ctx.handle, input.userId)
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
