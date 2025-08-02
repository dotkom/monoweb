import { CreatePersonalMarkSchema, PersonalMarkSchema, UserSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { authenticatedProcedure, procedure, t } from "../../trpc"

export const personalMarkRouter = t.router({
  getByUser: procedure
    .input(z.object({ id: UserSchema.shape.id }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.personalMarkService.findMarksByUserId(handle, input.id))
    ),
  getVisibleInformationForUser: authenticatedProcedure
    .input(z.object({ id: UserSchema.shape.id, paginate: PaginateInputSchema }))
    .query(async ({ ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.listVisibleInformationForUser(handle, ctx.principal.subject)
      )
    ),
  getByMark: procedure
    .input(z.object({ id: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.personalMarkService.findPersonalMarksByMark(handle, input.id))
    ),
  getPersonalMarkDetailsByMark: procedure
    .input(z.object({ id: PersonalMarkSchema.shape.markId, paginate: PaginateInputSchema }))
    .query(({ input, ctx }) =>
      ctx.executeTransaction((handle) => ctx.personalMarkService.findPersonalMarkDetails(handle, input.id))
    ),
  addToUser: authenticatedProcedure
    .input(CreatePersonalMarkSchema)
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) =>
        ctx.personalMarkService.addToUser(handle, input.userId, input.markId, ctx.principal.subject)
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
        ctx.personalMarkService.removeFromUser(handle, input.userId, input.markId)
      )
    ),
  getExpiryDateForUser: procedure
    .input(UserSchema.shape.id)
    .query(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => ctx.personalMarkService.getUserPunishment(handle, input))
    ),
})
