import { NotificationPermissionsWriteSchema, PrivacyPermissionsWriteSchema } from "@dotkomonline/types";
import { z } from "zod";

import { protectedProcedure } from "../../trpc";
import { t } from "../../trpc";

export const userRouter = t.router({
  getNotificationPermissionssByUserId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => ctx.userService.getNotificationPermissionsByUserId(input)),
  getPrivacyPermissionssByUserId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => ctx.userService.getPrivacyPermissionsByUserId(input)),
  updateNotificationPermissionssForUserId: protectedProcedure
    .input(
      z.object({
        data: NotificationPermissionsWriteSchema.omit({ userId: true }).partial(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => ctx.userService.updateNotificationPermissionsForUserId(input.id, input.data)),
  updatePrivacyPermissionssForUserId: protectedProcedure
    .input(
      z.object({
        data: PrivacyPermissionsWriteSchema.omit({ userId: true }).partial(),
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => ctx.userService.updatePrivacyPermissionsForUserId(input.id, input.data)),
});
