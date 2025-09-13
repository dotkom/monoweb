import { CreatePersonalMarkSchema, PersonalMarkSchema, UserSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query.ts"
import { authenticatedProcedure, staffProcedure, t } from "../../trpc.ts"

export const personalMarkRouter = t.router({
  getByUser: authenticatedProcedure.input(z.object({ userId: UserSchema.shape.id })).query(async ({ input, ctx }) => {
    ctx.authorize.requireMeOrAffiliation(input.userId, [])
    return ctx.executeTransaction(async (handle) => ctx.personalMarkService.findMarksByUserId(handle, input.userId))
  }),
  getVisibleInformation: authenticatedProcedure
    .input(z.object({ userId: UserSchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ ctx, input }) => {
      ctx.authorize.requireMeOrAffiliation(input.userId, [])
      return ctx.executeTransaction(async (handle) => {
        return ctx.personalMarkService.listVisibleInformationForUser(handle, ctx.principal.subject)
      })
    }),
  getByMark: staffProcedure
    .input(z.object({ markId: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) => {
      return ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.findPersonalMarksByMark(handle, input.markId)
      )
    }),
  getPersonalMarkDetailsByMark: staffProcedure
    .input(z.object({ markId: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
    .query(({ input, ctx }) =>
      ctx.executeTransaction((handle) => ctx.personalMarkService.findPersonalMarkDetails(handle, input.markId))
    ),
  addToUser: staffProcedure
    .input(CreatePersonalMarkSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.addToUser(handle, input.userId, input.markId, ctx.principal.subject)
      )
    ),
  countUsersWithMark: staffProcedure
    .input(z.object({ markId: PersonalMarkSchema.shape.markId }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.personalMarkService.countUsersByMarkId(handle, input.markId))
    ),
  removeFromUser: staffProcedure
    .input(PersonalMarkSchema.pick({ userId: true, markId: true }))
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.removeFromUser(handle, input.userId, input.markId)
      )
    ),
  getExpiryDateForUser: authenticatedProcedure
    .input(z.object({ userId: UserSchema.shape.id }))
    .query(async ({ input, ctx }) => {
      ctx.authorize.requireMeOrAffiliation(input.userId, [])
      return ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.findPunishmentByUserId(handle, input.userId)
      )
    }),
})
