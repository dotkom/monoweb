import { PersonalMarkSchema, UserSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { procedure, t } from "../../trpc"

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
  addToUser: procedure
    .input(PersonalMarkSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.addPersonalMarkToUserId(handle, input.userId, input.markId)
      )
    ),
  countUsersWithMark: procedure
    .input(z.object({ id: PersonalMarkSchema.shape.markId }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.personalMarkService.countUsersByMarkId(handle, input.id))
    ),
  removeFromUser: procedure
    .input(PersonalMarkSchema)
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
