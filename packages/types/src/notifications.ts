import { schemas } from "@dotkomonline/db/schemas"
import type z from "zod"

export const NotificationSchema = schemas.NotificationSchema.extend({})

export type Notification = z.infer<typeof NotificationSchema>

export const NotificationPayloadTypeSchema = schemas.NotificationPayloadTypeSchema

export type NotificationPayloadType = z.infer<typeof NotificationPayloadTypeSchema>

export const NotificationTypeSchema = schemas.NotificationTypeSchema

export type NotificationType = z.infer<typeof NotificationTypeSchema>
