import { PaginateInputSchema } from "@dotkomonline/core"
import { z } from "zod"
import { PersonalMarkSchema, UserSchema } from "@dotkomonline/types"
import { t, protectedProcedure } from "../../trpc"

export const personalMarkRouter = t.router({
  getByUser: protectedProcedure
    .input(z.object({ id: UserSchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) =>
      ctx.personalMarkService.getPersonalMarksForUserId(input.id, input.paginate.take, input.paginate.cursor)
    ),
  addToUser: protectedProcedure
    .input(PersonalMarkSchema)
    .mutation(async ({ input, ctx }) => ctx.personalMarkService.addPersonalMarkToUserId(input.userId, input.markId)),
  removeFromUser: protectedProcedure
    .input(PersonalMarkSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.personalMarkService.removePersonalMarkFromUserId(input.userId, input.markId)
    ),
  getExpiryDateForUser: protectedProcedure
    .input(UserSchema.shape.id)
    .query(async ({ input, ctx }) => ctx.personalMarkService.getExpiryDateForUserId(input)),
})
