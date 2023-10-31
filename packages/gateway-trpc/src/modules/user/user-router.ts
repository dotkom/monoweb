import { PaginateInputSchema } from "@dotkomonline/core"
import { NotificationPermissionsWriteSchema, PrivacyPermissionsWriteSchema, UserWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const userRouter = t.router({
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.userService.getAllUsers(input.take)),
  get: publicProcedure.input(z.string()).query(async ({ input, ctx }) => ctx.userService.getUser(input)),
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
  getNotificationPermissionssByUserId: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => ctx.userService.getNotificationPermissionsByUserId(input)),
  updateNotificationPermissionssForUserId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: NotificationPermissionsWriteSchema.omit({ userId: true }).partial(),
      })
    )
    .mutation(async ({ input, ctx }) => ctx.userService.updateNotificationPermissionsForUserId(input.id, input.data)),
})
