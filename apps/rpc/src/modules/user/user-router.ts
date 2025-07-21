import { PrivacyPermissionsWriteSchema, UserSchema, UserWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { authenticatedProcedure, procedure, t } from "../../trpc"

export const userRouter = t.router({
  all: procedure.input(PaginateInputSchema).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getAll(handle, input.take, 0)
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
  registerAndGet: procedure.input(UserSchema.shape.id).mutation(async ({ input, ctx }) =>
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
  getPrivacyPermissionsByUserId: procedure.input(z.string()).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getPrivacyPermissionsByUserId(handle, input)
    })
  ),
  updatePrivacyPermissionsForUserId: procedure
    .input(
      z.object({
        id: z.string(),
        data: PrivacyPermissionsWriteSchema.partial(),
      })
    )
    .mutation(async ({ input, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return ctx.userService.updatePrivacyPermissionsForUserId(handle, input.id, input.data)
      })
    ),
  searchByFullName: procedure.input(z.object({ searchQuery: z.string() })).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.searchForUser(handle, input.searchQuery, 30, 0)
    })
  ),
  isAdmin: authenticatedProcedure.query(async ({ ctx }) => {
    try {
      ctx.authorize.requireAffiliation()
      return true
    } catch {
      return false
    }
  }),
})
