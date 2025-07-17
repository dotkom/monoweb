import { Auth0UserSchema, Auth0UserWriteSchema, PrivacyPermissionsWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { PaginateInputSchema } from "../../query"
import { adminProcedure, protectedProcedure, publicProcedure, t } from "../../trpc"

export const userRouter = t.router({
  all: adminProcedure.input(PaginateInputSchema).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getAll(handle, input.take, 0)
    })
  ),
  get: adminProcedure.input(Auth0UserSchema.shape.id).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getById(handle, input)
    })
  ),
  getByProfileSlug: publicProcedure.input(z.string()).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getByProfileSlug(handle, input)
    })
  ),
  registerAndGet: protectedProcedure.input(Auth0UserSchema.shape.id).mutation(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.register(handle, input)
    })
  ),
  getMe: protectedProcedure.query(async ({ ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getById(handle, ctx.principal)
    })
  ),
  update: protectedProcedure
    .input(
      z.object({
        id: Auth0UserSchema.shape.id,
        input: Auth0UserWriteSchema.partial(),
      })
    )
    .mutation(async ({ input: changes, ctx }) =>
      ctx.executeTransaction(async (handle) => {
        return ctx.userService.update(handle, changes.id, changes.input)
      })
    ),
  getPrivacyPermissionsByUserId: protectedProcedure.input(z.string()).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.getPrivacyPermissionsByUserId(handle, input)
    })
  ),
  updatePrivacyPermissionsForUserId: protectedProcedure
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
  searchByFullName: adminProcedure.input(z.object({ searchQuery: z.string() })).query(async ({ input, ctx }) =>
    ctx.executeTransaction(async (handle) => {
      return ctx.userService.searchForUser(handle, input.searchQuery, 30, 0)
    })
  ),
  isAdmin: protectedProcedure.query(
    async ({ ctx }) => ctx.adminPrincipals.includes("*") || ctx.adminPrincipals.includes(ctx.principal)
  ),
})
