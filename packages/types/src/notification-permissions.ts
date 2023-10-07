import { z } from "zod";

export const NotificationPermissionsSchema = z.object({
  applications: z.boolean(),
  createdAt: z.date(),
  groupMessages: z.boolean(),
  markRulesUpdates: z.boolean(), // should not be able to disable
  newArticles: z.boolean(),
  receipts: z.boolean(),
  registrationByAdministrator: z.boolean(),
  registrationStart: z.boolean(),
  standardNotifications: z.boolean(),
  updatedAt: z.date(),
  userId: z.string(),
});

export type NotificationPermissions = z.infer<typeof NotificationPermissionsSchema>;

export const NotificationPermissionsWriteSchema = NotificationPermissionsSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type NotificationPermissionsWrite = z.infer<typeof NotificationPermissionsWriteSchema>;
