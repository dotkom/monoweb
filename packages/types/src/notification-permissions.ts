import { z } from "zod"

export const NotificationPermissionsSchema = z.object({
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  applications: z.boolean(),
  newArticles: z.boolean(),
  standardNotifications: z.boolean(),
  groupMessages: z.boolean(),
  prikkereglerUpdates: z.boolean(), // should not be able to disable
  receipts: z.boolean(),
  registrationByAdministrator: z.boolean(),
  registrationStart: z.boolean(),
})

export type NotificationPermissions = z.infer<typeof NotificationPermissionsSchema>

export const NotificationPermissionsWriteSchema = NotificationPermissionsSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type NotificationPermissionsWrite = z.infer<typeof NotificationPermissionsWriteSchema>
