import { PaginateInputSchema } from "@dotkomonline/core"
import { PersonalMarkSchema, UserSchema } from "@dotkomonline/types"
import { z } from "zod"
import { adminProcedure, t } from "../../trpc"

export const personalMarkRouter = t.router({
  getByUser: adminProcedure
    .input(z.object({ id: UserSchema.shape.id }))
    .query(async ({ input, ctx }) => ctx.personalMarkService.getPersonalMarksForUserId(input.id)),
  getByMark: adminProcedure
    .input(z.object({ id: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) => ctx.personalMarkService.getPersonalMarksByMarkId(input.id)),
  addToUser: adminProcedure
    .input(PersonalMarkSchema)
    .mutation(async ({ input, ctx }) => ctx.personalMarkService.addPersonalMarkToUserId(input.userId, input.markId)),
  countUsersWithMark: adminProcedure
    .input(z.object({ id: PersonalMarkSchema.shape.markId }))
    .query(async ({ input, ctx }) => ctx.personalMarkService.countUsersByMarkId(input.id)),
  removeFromUser: adminProcedure
    .input(PersonalMarkSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.personalMarkService.removePersonalMarkFromUserId(input.userId, input.markId)
    ),
  getExpiryDateForUser: adminProcedure
    .input(UserSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.personalMarkService.getExpiryDateForUserId(input)),
})
