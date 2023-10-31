import { NotificationPermissionsWriteSchema, PrivacyPermissionsWriteSchema, UserWriteSchema, UserSchema } from "@dotkomonline/types"
import { protectedProcedure, publicProcedure } from "../../trpc"
import { t } from "../../trpc"
import { z } from "zod"
import { PaginateInputSchema } from "@dotkomonline/core"

export const userRouter = t.router({
  all: publicProcedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.userService.getAllUsers(input.take)
  }),
  get: publicProcedure.input(UserSchema.shape.id).query(({ input, ctx }) => {
    return ctx.userService.getUsrById(input)
  }),
  edit: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: UserWriteSchema,
      })
    )
    .mutation(({ input: changes, ctx }) => {
      return ctx.userService.updateUser(changes.id, changes.data)
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
