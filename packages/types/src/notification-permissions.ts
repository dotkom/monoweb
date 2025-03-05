import type { z } from "zod"

import { schemas } from "@dotkomonline/db/schemas"

export const NotificationPermissionsSchema = schemas.NotificationPermissionsSchema.extend({})

export type NotificationPermissions = z.infer<typeof NotificationPermissionsSchema>

export const NotificationPermissionsWriteSchema = NotificationPermissionsSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type NotificationPermissionsWrite = z.infer<typeof NotificationPermissionsWriteSchema>
