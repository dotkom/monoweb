import { NotificationPermissionsWriteSchema, PrivacyPermissionsWriteSchema } from "@dotkomonline/types"
import { protectedProcedure, publicProcedure } from "../../trpc"
import { t } from "../../trpc"
import { z } from "zod"
import { PaginateInputSchema } from "@dotkomonline/core"

export const userRouter = t.router({
  all: publicProcedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.userService.getAllUsers(input.take)
  }),
  getPrivacyPermissionssByUserId: protectedProcedure.input(z.string()).query(({ input, ctx }) => {
    return ctx.userService.getPrivacyPermissionsByUserId(input)
  }),
  updatePrivacyPermissionssForUserId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: PrivacyPermissionsWriteSchema.omit({ userId: true }).partial(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.userService.updatePrivacyPermissionsForUserId(input.id, input.data)
    }),
  getNotificationPermissionssByUserId: protectedProcedure.input(z.string()).query(({ input, ctx }) => {
    return ctx.userService.getNotificationPermissionsByUserId(input)
  }),
  updateNotificationPermissionssForUserId: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: NotificationPermissionsWriteSchema.omit({ userId: true }).partial(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.userService.updateNotificationPermissionsForUserId(input.id, input.data)
    }),
})
