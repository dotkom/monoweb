import { CreatePersonalMarkSchema, PersonalMarkSchema, UserSchema } from "@dotkomonline/types"
import type { inferProcedureInput, inferProcedureOutput } from "@trpc/server"
import { z } from "zod"
import { isEditor } from "../../authorization"
import { withAuditLogEntry, withAuthentication, withAuthorization, withDatabaseTransaction } from "../../middlewares"
import { PaginateInputSchema } from "../../query"
import { procedure, t } from "../../trpc"

export type GetPersonalMarksByUserInput = inferProcedureInput<typeof getPersonalMarksByUserProcedure>
export type GetPersonalMarksByUserOutput = inferProcedureOutput<typeof getPersonalMarksByUserProcedure>
const getPersonalMarksByUserProcedure = procedure
  .input(z.object({ userId: UserSchema.shape.id }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    ctx.authorize.requireMe(input.userId)
    return ctx.personalMarkService.findMarksByUserId(ctx.handle, input.userId)
  })

export type GetVisibleInformationInput = inferProcedureInput<typeof getVisibleInformationProcedure>
export type GetVisibleInformationOutput = inferProcedureOutput<typeof getVisibleInformationProcedure>
const getVisibleInformationProcedure = procedure
  .input(z.object({ userId: UserSchema.shape.id, paginate: PaginateInputSchema }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ ctx, input }) => {
    ctx.authorize.requireMe(input.userId)
    return ctx.personalMarkService.listVisibleInformationForUser(ctx.handle, ctx.principal.subject)
  })

export type GetPersonalMarksByMarkInput = inferProcedureInput<typeof getPersonalMarksByMarkProcedure>
export type GetPersonalMarksByMarkOutput = inferProcedureOutput<typeof getPersonalMarksByMarkProcedure>
const getPersonalMarksByMarkProcedure = procedure
  .input(z.object({ markId: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.personalMarkService.findPersonalMarksByMarkId(ctx.handle, input.markId)
  })

export type GetPersonalMarkDetailsByMarkInput = inferProcedureInput<typeof getPersonalMarkDetailsByMarkProcedure>
export type GetPersonalMarkDetailsByMarkOutput = inferProcedureOutput<typeof getPersonalMarkDetailsByMarkProcedure>
const getPersonalMarkDetailsByMarkProcedure = procedure
  .input(z.object({ markId: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.personalMarkService.findPersonalMarkDetails(ctx.handle, input.markId)
  })

export type AddPersonalMarkToUserInput = inferProcedureInput<typeof addPersonalMarkToUserProcedure>
export type AddPersonalMarkToUserOutput = inferProcedureOutput<typeof addPersonalMarkToUserProcedure>
const addPersonalMarkToUserProcedure = procedure
  .input(CreatePersonalMarkSchema)
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.personalMarkService.addToUser(ctx.handle, input.userId, input.markId, ctx.principal.subject)
  })

export type CountUsersWithMarkInput = inferProcedureInput<typeof countUsersWithMarkProcedure>
export type CountUsersWithMarkOutput = inferProcedureOutput<typeof countUsersWithMarkProcedure>
const countUsersWithMarkProcedure = procedure
  .input(z.object({ markId: PersonalMarkSchema.shape.markId }))
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    return ctx.personalMarkService.countUsersByMarkId(ctx.handle, input.markId)
  })

export type RemovePersonalMarkFromUserInput = inferProcedureInput<typeof removePersonalMarkFromUserProcedure>
export type RemovePersonalMarkFromUserOutput = inferProcedureOutput<typeof removePersonalMarkFromUserProcedure>
const removePersonalMarkFromUserProcedure = procedure
  .input(PersonalMarkSchema.pick({ userId: true, markId: true }))
  .use(withAuthentication())
  .use(withAuthorization(isEditor()))
  .use(withDatabaseTransaction())
  .use(withAuditLogEntry())
  .mutation(async ({ input, ctx }) => {
    return ctx.personalMarkService.removeFromUser(ctx.handle, input.userId, input.markId)
  })

export type GetExpiryDateForUserInput = inferProcedureInput<typeof getExpiryDateForUserProcedure>
export type GetExpiryDateForUserOutput = inferProcedureOutput<typeof getExpiryDateForUserProcedure>
const getExpiryDateForUserProcedure = procedure
  .input(z.object({ userId: UserSchema.shape.id }))
  .use(withAuthentication())
  .use(withDatabaseTransaction())
  .query(async ({ input, ctx }) => {
    ctx.authorize.requireMe(input.userId)
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
