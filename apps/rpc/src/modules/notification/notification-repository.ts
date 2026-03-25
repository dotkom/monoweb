import type { DBHandle } from "@dotkomonline/db"
import {
  type Notification,
  type NotificationId,
  type NotificationWrite,
  type NotificationRecipientId,
  type NotificationRecipient,
  type UserNotification,
  NotificationSchema,
  NotificationRecipientSchema,
  UserNotificationSchema,
} from "./notification-types"
import { parseOrReport } from "../../invariant"
import type { UserId } from "@dotkomonline/types"
import { type Pageable, pageQuery } from "@dotkomonline/utils"

export interface NotificationRepository {
  findById(handle: DBHandle, notificationId: NotificationId): Promise<Notification | null>
  findMany(handle: DBHandle, page: Pageable): Promise<Notification[]>
  createWithRecipients(handle: DBHandle, notificationData: NotificationWrite): Promise<Notification>
  update(
    handle: DBHandle,
    notificationId: NotificationId,
    notificationData: Partial<NotificationWrite>
  ): Promise<Notification>
  delete(handle: DBHandle, notificationId: NotificationId): Promise<boolean>

  addRecipients(
    handle: DBHandle,
    notificationId: NotificationId,
    recipientIds: UserId[]
  ): Promise<NotificationRecipient[]>
  removeRecipients(handle: DBHandle, notificationId: NotificationId, recipientIds: UserId[]): Promise<number>

  findRecipient(
    handle: DBHandle,
    recipientId: NotificationRecipientId,
    userId: UserId
  ): Promise<NotificationRecipient | null>
  findAllForUser(handle: DBHandle, userId: UserId): Promise<UserNotification[]>
  getUnreadCountForUser(handle: DBHandle, userId: UserId): Promise<number>
  markAsRead(handle: DBHandle, notificationId: NotificationId, userId: UserId): Promise<NotificationRecipient>
  markAllAsRead(handle: DBHandle, userId: UserId): Promise<NotificationRecipient>
}

export function getNotificationRepository(): NotificationRepository {
  return {
    async findById(handle, notificationId) {
      const notification = await handle.notification.findUnique({
        where: { id: notificationId },
        include: {
          actorGroup: {
            include: {
              roles: true,
            },
          },
        },
      })
      return parseOrReport(NotificationSchema, notification)
    },

    async createWithRecipients(handle, data) {
      const { recipientIds, ...notificationData } = data
      const notification = await handle.notification.create({
        data: {
          ...notificationData,
          recipients: {
            createMany: {
              data: recipientIds.map((userId) => ({
                userId,
              })),
            },
          },
        },
        include: {
          actorGroup: {
            include: {
              roles: true,
            },
          },
        },
      })
      return parseOrReport(NotificationSchema, notification)
    },

    async update(handle, notificationId, data) {
      const notification = await handle.notification.update({
        where: { id: notificationId },
        data,
        include: {
          actorGroup: {
            include: {
              roles: true,
            },
          },
        },
      })
      return parseOrReport(NotificationSchema, notification)
    },

    async findMany(handle, page) {
      const results = await handle.notification.findMany({
        ...pageQuery(page),
        include: {
          actorGroup: {
            include: {
              roles: true,
            },
          },
        },
      })
      return parseOrReport(NotificationSchema.array(), results)
    },

    async delete(handle, notificationId) {
      const deletedNotification = await handle.notification.delete({
        where: { id: notificationId },
      })
      return !!deletedNotification
    },

    async findRecipient(handle, recipientId, userId) {
      const recipient = await handle.notificationRecipient.findFirst({
        where: {
          id: recipientId,
          userId,
        },
      })
      return parseOrReport(NotificationRecipientSchema, recipient)
    },

    async addRecipients(handle, notificationId, recipientIds) {
      const recipients = await handle.notificationRecipient.createMany({
        data: recipientIds.map((userId) => ({
          notificationId,
          userId,
        })),
      })
      return parseOrReport(NotificationRecipientSchema.array(), recipients)
    },

    async removeRecipients(handle, notificationId, recipientIds) {
      const result = await handle.notificationRecipient.deleteMany({
        where: {
          notificationId,
          userId: { in: recipientIds },
        },
      })
      return result.count
    },

    async findAllForUser(handle, userId) {
      const userNotifications = await handle.notificationRecipient.findMany({
        where: { userId },
        include: {
          notification: {
            include: {
              actorGroup: {
                include: {
                  roles: true,
                },
              },
            },
          },
        },
      })
      return parseOrReport(UserNotificationSchema.array(), userNotifications)
    },

    async getUnreadCountForUser(handle, userId) {
      return handle.notificationRecipient.count({
        where: { userId, readAt: null },
      })
    },

    async markAsRead(handle, notificationId, userId) {
      const notificationRecipient = await handle.notificationRecipient.updateMany({
        where: { notificationId, userId, readAt: null },
        data: { readAt: new Date() },
      })
      return parseOrReport(NotificationRecipientSchema, notificationRecipient)
    },

    async markAllAsRead(handle, userId) {
      const notificationRecipient = await handle.notificationRecipient.updateMany({
        where: { userId, readAt: null },
        data: { readAt: new Date() },
      })
      return parseOrReport(NotificationRecipientSchema, notificationRecipient)
    },
  }
}
