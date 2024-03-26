import { PaginateInputSchema } from "@dotkomonline/core"
import {
  NotificationPermissionsWriteSchema,
  PrivacyPermissionsWriteSchema,
  UserSchema,
  UserWriteSchema,
} from "@dotkomonline/types"
import { z } from "zod"
import { protectedProcedure, publicProcedure, t } from "../../trpc"

export const userRouter = t.router({
  all: publicProcedure
    .input(PaginateInputSchema)
    .query(async ({ input, ctx }) => ctx.userService.getAllUsers(input.take)),
  get: publicProcedure.input(UserSchema.shape.id).query(async ({ input, ctx }) => ctx.userService.getUserById(input)),
  getMany: publicProcedure
    .input(z.array(UserSchema.shape.id))
    .query(async ({ input, ctx }) => ctx.userService.getUsersById(input)),
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
  // not used
  // getNotificationPermissionssByUserId: protectedProcedure
  //   .input(z.string())
  //   .query(async ({ input, ctx }) => ctx.userService.getNotificationPermissionsByUserId(input)),
  // updateNotificationPermissionssForUserId: protectedProcedure
  //   .input(
  //     z.object({
  //       id: z.string(),
  //       data: NotificationPermissionsWriteSchema.omit({ userId: true }).partial(),
  //     })
  //   )
  //   .mutation(async ({ input, ctx }) => ctx.userService.updateNotificationPermissionsForUserId(input.id, input.data)),
  searchByFullName: protectedProcedure
    .input(z.object({ searchQuery: z.string(), paginate: PaginateInputSchema }))
    .query(async ({ input, ctx }) => ctx.userService.searchByFullName(input.searchQuery, input.paginate.take)),
})
