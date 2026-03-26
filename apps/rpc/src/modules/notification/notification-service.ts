import type { DBHandle } from "@dotkomonline/db"
import type { UserId } from "@dotkomonline/types"
import type { NotificationRepository } from "./notification-repository"
import type { Pageable } from "@dotkomonline/utils"
import type { UserRepository } from "../user/user-repository"
import type {
  Notification,
  NotificationId,
  NotificationRecipient,
  NotificationRecipientId,
  NotificationWrite,
  UserNotification,
} from "./notification-types"

export interface NotificationService {
  findById(handle: DBHandle, notificationId: NotificationId): Promise<Notification | null>
  findMany(handle: DBHandle, page: Pageable): Promise<Notification[]>
  createWithRecipients(handle: DBHandle, notificationData: NotificationWrite): Promise<Notification>
  update(
    handle: DBHandle,
    notificationId: NotificationId,
    notificationData: Partial<NotificationWrite>
  ): Promise<Notification>
  delete(handle: DBHandle, notificationId: NotificationId): Promise<boolean>

  addRecipients(handle: DBHandle, notificationId: NotificationId, recipientIds: UserId[]): Promise<void>
  removeRecipients(handle: DBHandle, notificationId: NotificationId, recipientIds: UserId[]): Promise<void>

  findRecipient(
    handle: DBHandle,
    recipientId: NotificationRecipientId,
    userId: UserId
  ): Promise<NotificationRecipient | null>
  findAllForUser(handle: DBHandle, userId: UserId, page: Pageable): Promise<UserNotification[]>
  getUnreadCountForUser(handle: DBHandle, userId: UserId): Promise<number>
  markAsRead(handle: DBHandle, notificationId: NotificationId, userId: UserId): Promise<boolean>
  markAllAsRead(handle: DBHandle, userId: UserId): Promise<boolean>
}

export function getNotificationService(
  notificationRepository: NotificationRepository,
  userRepository: UserRepository
): NotificationService {
  return {
    async findById(handle, notificationId) {
      return await notificationRepository.findById(handle, notificationId)
    },

    async findMany(handle, page) {
      return await notificationRepository.findMany(handle, page)
    },

    async createWithRecipients(handle, notificationData) {
      const data = { ...notificationData }
      if (data.recipientIds.length === 0) {
        const users = await userRepository.findMany(handle, {}, { take: 10000 })
        data.recipientIds = users.map((user) => user.id)
      }
      return await notificationRepository.createWithRecipients(handle, data)
    },

    async update(handle, notificationId, notificationData) {
      return await notificationRepository.update(handle, notificationId, notificationData)
    },

    async delete(handle, notificationId) {
      return await notificationRepository.delete(handle, notificationId)
    },

    async addRecipients(handle, notificationId, recipientIds) {
      await notificationRepository.addRecipients(handle, notificationId, recipientIds)
    },

    async removeRecipients(handle, notificationId, recipientIds) {
      await notificationRepository.removeRecipients(handle, notificationId, recipientIds)
    },

    async findRecipient(handle, recipientId, userId) {
      return await notificationRepository.findRecipient(handle, recipientId, userId)
    },

    async findAllForUser(handle, userId, page) {
      return await notificationRepository.findAllForUser(handle, userId, page)
    },

    async getUnreadCountForUser(handle, userId) {
      return await notificationRepository.getUnreadCountForUser(handle, userId)
    },

    async markAsRead(handle, notificationId, userId) {
      return await notificationRepository.markAsRead(handle, notificationId, userId)
    },

    async markAllAsRead(handle, userId) {
      return await notificationRepository.markAllAsRead(handle, userId)
    },
  }
}
