import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"

export type Notification = z.infer<typeof NotificationSchema>
export const NotificationSchema = schemas.NotificationSchema
export type NotificationId = Notification["id"]
export type NotificationType = Notification["type"]
export type NotificationPayloadType = Notification["payloadType"]

export const NotificationTypeSchema = schemas.NotificationTypeSchema
export const NotificationPayloadTypeSchema = schemas.NotificationPayloadTypeSchema

export const NotificationRecipientSchema = schemas.NotificationRecipientSchema
export type NotificationRecipient = z.infer<typeof NotificationRecipientSchema>

export type NotificationRecipientId = NotificationRecipient["id"]


export type UserNotification = z.infer<typeof UserNotificationSchema>
export const UserNotificationSchema = schemas.NotificationRecipientSchema.extend({
  notification: schemas.NotificationSchema,
})

export type NotificationWrite = z.infer<typeof NotificationWriteSchema>
export const NotificationWriteSchema = NotificationSchema.pick({
  title: true,
  shortDescription: true,
  content: true,
  type: true,
  payload: true,
  payloadType: true,
  actorGroupId: true,
  taskId: true,
}).extend({
  recipientIds: z.array(z.string().uuid()).min(1),
})


