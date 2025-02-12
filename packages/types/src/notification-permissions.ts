import type { z } from "zod"

import { dbSchemas } from "@dotkomonline/db"

export const NotificationPermissionsSchema = dbSchemas.NotificationPermissionsSchema.extend({})

export type NotificationPermissions = z.infer<typeof NotificationPermissionsSchema>

export const NotificationPermissionsWriteSchema = NotificationPermissionsSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type NotificationPermissionsWrite = z.infer<typeof NotificationPermissionsWriteSchema>
