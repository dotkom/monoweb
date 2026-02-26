import type { DBHandle } from "@dotkomonline/db"
import type {
  Notification,
  NotificationId,
  NotificationWrite,
  NotificationRecipientId,
  NotificationRecipient,
  UserNotification,
} from "./notification"

import type { UserId } from "@dotkomonline/types"

export interface NotificationRepository {
  findById(handle: DBHandle, notificationId: NotificationId): Promise<Notification | null>
  create(handle: DBHandle, notificationData: NotificationWrite): Promise<Notification>
  update(
    handle: DBHandle,
    notificationId: NotificationId,
    notificationData: Partial<NotificationWrite>
  ): Promise<Notification>
  delete(handle: DBHandle, notificationId: NotificationId): Promise<Notification | null>

  addRecipients(handle: DBHandle, notificationId: NotificationId, recipientIds: UserId[]): Promise<void>
  removeRecipients(handle: DBHandle, notificationId: NotificationId, recipientIds: UserId[]): Promise<void>

  findRecipient(
    handle: DBHandle,
    recipientId: NotificationRecipientId,
    userId: UserId
  ): Promise<NotificationRecipient | null>
  findAllForUser(handle: DBHandle, userId: UserId): Promise<UserNotification[]>
  getUnreadCountForUser(handle: DBHandle, userId: UserId): Promise<number>
  markAsRead(handle: DBHandle, notificationId: NotificationId, userId: UserId): Promise<void>
  markAllAsRead(handle: DBHandle, userId: UserId): Promise<void>
}

export function getNotificationRepository(): NotificationRepository {
  return {
    async findById(handle, notificationId) {
      const notification = await handle.notification.findUnique({
        where: { id: notificationId },
      })
      return notification
    },

    async create(handle, notificationData) {
      const { recipientIds, ...data } = notificationData
      const notification = await handle.notification.create({ data })
      return notification
    },
    async update(handle, notificationId, notificationData) {
      const { recipientIds, ...data } = notificationData
      const notification = await handle.notification.update({
        where: { id: notificationId },
        data,
      })
      return notification
    },
    async delete(handle, notificationId) {
      const notification = await handle.notification.findUnique({
        where: { id: notificationId },
      })
      await handle.notification.delete({
        where: { id: notificationId },
      })
      return notification
    },
    async findRecipient(handle, recipientId, userId) {
      const recipient = await handle.notificationRecipient.findFirst({
        where: {
          id: recipientId,
          userId,
        },
      })
      return recipient
    },
    async addRecipients(handle, notificationId, recipientIds) {
      await handle.notificationRecipient.createMany({
        data: recipientIds.map((userId) => ({
          notificationId,
          userId,
        })),
      })
    },
    async removeRecipients(handle, notificationId, recipientIds) {
      await handle.notificationRecipient.deleteMany({
        where: {
          notificationId,
          userId: { in: recipientIds },
        },
      })
    },

    async findAllForUser(handle, userId) {
      return handle.notificationRecipient.findMany({
        where: { userId },
        include: { notification: true },
      })
    },

    async getUnreadCountForUser(handle, userId) {
      return handle.notificationRecipient.count({
        where: { userId, readAt: null },
      })
    },
    async markAsRead(handle, notificationId, userId) {
      await handle.notificationRecipient.updateMany({
        where: { notificationId, userId, readAt: null },
        data: { readAt: new Date() },
      })
    },

    async markAllAsRead(handle, userId) {
      await handle.notificationRecipient.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
      })
    },
  }
}
