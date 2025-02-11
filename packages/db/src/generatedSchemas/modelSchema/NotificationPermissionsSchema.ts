import { z } from 'zod';

/////////////////////////////////////////
// NOTIFICATION PERMISSIONS SCHEMA
/////////////////////////////////////////

export const NotificationPermissionsSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
  applications: z.boolean(),
  newArticles: z.boolean(),
  standardNotifications: z.boolean(),
  groupMessages: z.boolean(),
  markRulesUpdates: z.boolean(),
  receipts: z.boolean(),
  registrationByAdministrator: z.boolean(),
  registrationStart: z.boolean(),
})

export type NotificationPermissions = z.infer<typeof NotificationPermissionsSchema>

export default NotificationPermissionsSchema;
