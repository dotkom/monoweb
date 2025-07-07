import { PaginateInputSchema } from "@dotkomonline/core"
import { PersonalMarkSchema, UserSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, t } from "../../trpc"

export const personalMarkRouter = t.router({
  getByUser: adminProcedure
    .input(z.object({ id: UserSchema.shape.id }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.getPersonalMarksForUserId(handle, input.id)
      )
    ),
  getByMark: adminProcedure
    .input(z.object({ id: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.getPersonalMarksByMarkId(handle, input.id)
      )
    ),
  addToUser: adminProcedure
    .input(PersonalMarkSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.addPersonalMarkToUserId(handle, input.userId, input.markId)
      )
    ),
  countUsersWithMark: adminProcedure
    .input(z.object({ id: PersonalMarkSchema.shape.markId }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.countUsersByMarkId(handle, input.id)
      )
    ),
  removeFromUser: adminProcedure
    .input(PersonalMarkSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.removePersonalMarkFromUserId(handle, input.userId, input.markId)
      )
    ),
  getExpiryDateForUser: adminProcedure
    .input(UserSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.getExpiryDateForUserId(handle, input)
      )
    ),
})