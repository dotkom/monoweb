import { CreatePersonalMarkSchema, PersonalMarkSchema, UserSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { authenticatedProcedure, procedure, t } from "../../trpc"

export const personalMarkRouter = t.router({
  getByUser: procedure
    .input(z.object({ id: UserSchema.shape.id }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.personalMarkService.getPersonalMarksForUserId(handle, input.id))
    ),
  getByMark: procedure
    .input(z.object({ id: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.personalMarkService.getPersonalMarksByMarkId(handle, input.id))
    ),
  getDashboardPersonalMarksByMark: procedure
    .input(z.object({ id: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
    .query(({ input, ctx }) =>
      ctx.executeTransaction((handle) => ctx.personalMarkService.getDashboardPersonalMarksByMarkId(handle, input.id))
    ),
  addToUser: authenticatedProcedure
    .input(CreatePersonalMarkSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.addPersonalMarkToUserId(handle, input.userId, input.markId, ctx.principal.subject)
      )
    ),
  countUsersWithMark: procedure
    .input(z.object({ id: PersonalMarkSchema.shape.markId }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.personalMarkService.countUsersByMarkId(handle, input.id))
    ),
  removeFromUser: procedure
    .input(PersonalMarkSchema.pick({ userId: true, markId: true }))
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.removePersonalMarkFromUserId(handle, input.userId, input.markId)
      )
    ),
  getExpiryDateForUser: procedure
    .input(UserSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.personalMarkService.getExpiryDateForUserId(handle, input))
    ),
})
