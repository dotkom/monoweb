import { protectedProcedure, t } from "../../trpc"

import { PaginateInputSchema } from "@dotkomonline/core"
import { z } from "zod"
import { PersonalMarkSchema, UserSchema } from "@dotkomonline/types"

export const personalMarkRouter = t.router({
  getByUser: protectedProcedure
    .input(z.object({ id: UserSchema.shape.id, paginate: PaginateInputSchema }))
    .query(({ input, ctx }) => {
      return ctx.personalMarkService.getPersonalMarksForUserId(input.id, input.paginate.take, input.paginate.cursor)
    }),
  addToUser: protectedProcedure.input(PersonalMarkSchema).mutation(({ input, ctx }) => {
    return ctx.personalMarkService.addPersonalMarkToUserId(input.userId, input.markId)
  }),
  removeFromUser: protectedProcedure.input(PersonalMarkSchema).mutation(({ input, ctx }) => {
    return ctx.personalMarkService.removePersonalMarkFromUserId(input.userId, input.markId)
  }),
  getExpiryDateForUser: protectedProcedure.input(UserSchema.shape.id).query(({ input, ctx }) => {
    return ctx.personalMarkService.getExpiryDateForUserId(input)
  }),
})
