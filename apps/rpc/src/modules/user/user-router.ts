import { UserSchema, UserWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { authenticatedProcedure, procedure, t } from "../../trpc"

export const userRouter = t.router({
  all: procedure.input(PaginateInputSchema).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.findUsers(
        handle,
        {
          byName: null,
        },
        input
      )
    })
  ),
  get: procedure.input(UserSchema.shape.id).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getById(handle, input)
    })
  ),
  getByProfileSlug: procedure.input(z.string()).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getByProfileSlug(handle, input)
    })
  ),
  register: procedure.input(UserSchema.shape.id).mutation(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.register(handle, input)
    })
  ),
  getMe: authenticatedProcedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getById(handle, ctx.principal.subject)
    })
  ),
  update: procedure
    .input(
      z.object({
        id: UserSchema.shape.id,
        input: UserWriteSchema.partial(),
      })
    )
    .mutation(async ({ input: changes, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return ctx.userService.update(handle, changes.id, changes.input)
      })
    ),
  searchByFullName: procedure.input(z.object({ searchQuery: z.string() })).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.findUsers(handle, {
        byName: input.searchQuery,
      })
    })
  ),
  isStaff: authenticatedProcedure.query(async ({ ctx }) => {
    try {
      ctx.authorize.requireAffiliation()
      return true
    } catch {
      return false
    }
  }),
})
