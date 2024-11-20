import { PaginateInputSchema } from "@dotkomonline/core"
import { PrivacyPermissionsWriteSchema, UserSchema, UserWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const userRouter = t.router({
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.userService.getAll(input.take, 0)),
  get: publicProcedure.input(UserSchema.shape.id).query(async ({ input, ctx }) => ctx.userService.getById(input)),
  getMe: protectedProcedure.query(async ({ ctx }) => ctx.userService.getById(ctx.principal)),
  update: protectedProcedure
    .input(
      z.object({
        id: UserSchema.shape.id,
        input: UserWriteSchema.partial(),
      })
    )
    .mutation(async ({ input: changes, ctx }) => ctx.userService.update(changes.id, changes.input)),
  getPrivacyPermissionssByUserId: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => ctx.userService.getPrivacyPermissionsByUserId(input)),
  updatePrivacyPermissionssForUserId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: PrivacyPermissionsWriteSchema.omit({ userId: true }).partial(),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.userService.updatePrivacyPermissionsForUserId(input.id, input.data)),
  searchByFullName: protectedProcedure
    .input(z.object({ searchQuery: z.string() }))
    .query(async ({ input, ctx }) => ctx.userService.searchForUser(input.searchQuery, 30, 0)),
})
