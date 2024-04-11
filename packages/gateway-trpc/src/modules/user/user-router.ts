import { PaginateInputSchema } from "@dotkomonline/core"
import { PrivacyPermissionsWriteSchema, UserSchema, UserWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const userRouter = t.router({
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.userService.getAllUsers(input.take)),
  get: publicProcedure.input(UserSchema.shape.auth0Id).query(async ({ input, ctx }) => ctx.userService.getById(input)),
  getMe: protectedProcedure.query(async ({ ctx }) => ctx.userService.getById(ctx.auth.userId)),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: UserWriteSchema,
      })
    )
    .mutation(async ({ input: changes, ctx }) => ctx.userService.updateUser(changes.id, changes.data)),
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
    .input(z.object({ searchQuery: z.string(), paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) => ctx.userService.searchByFullName(input.searchQuery, input.paginate.take)),
})
