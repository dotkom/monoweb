import { NotificationPermissionsWriteSchema, PrivacyPermissionsWriteSchema } from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, t } from "../../trpc"

export const userRouter = t.router({
  getPrivacyPermissionssByUserId: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => ctx.userService.getPrivacyPermissionsByUserId(input)),
import { NotificationPermissionsWriteSchema, PrivacyPermissionsWriteSchema, UserWriteSchema } from "@dotkomonline/types"
import { protectedProcedure, publicProcedure } from "../../trpc"
import { t } from "../../trpc"
import { z } from "zod"
import { PaginateInputSchema } from "@dotkomonline/core"

export const userRouter = t.router({
  all: publicProcedure.input(PaginateInputSchema).query(({ input, ctx }) => {
    return ctx.userService.getAllUsers(input.take)
  }),
  get: publicProcedure.input(z.string()).query(({ input, ctx }) => {
    return ctx.userService.getUser(input)
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
