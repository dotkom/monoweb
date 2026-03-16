import type { DBHandle } from "@dotkomonline/db"
import type {
  Notification,
  NotificationId,
  NotificationRecipient,
  NotificationRecipientId,
  NotificationWrite,
  UserNotification,
} from "./notification"
import type { UserId } from "@dotkomonline/types"
import type { NotificationRepository } from "./notification-repository"
import { Pageable } from "src/query"
import { UserRepository } from "../user/user-repository"

export interface NotificationService {
  findById(handle: DBHandle, notificationId: NotificationId): Promise<Notification | null>
  findMany(handle: DBHandle, page: Pageable): Promise<Notification[]>
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

export function getNotificationService(notificationRepository: NotificationRepository, userRepository: UserRepository): NotificationService {
  return {
    async findById(handle, notificationId) {
      return await notificationRepository.findById(handle, notificationId)
    },
     async findMany(handle, page) {
      return await notificationRepository.findMany(handle, page)
    },
    
    async create(handle, notificationData) {
      const data = { ...notificationData }
      if (data.recipientIds.length === 0) {
        const users =  await userRepository.findMany(handle, {}, { take: 10000 })
        data.recipientIds = users.map(user => user.id)
      }
      return await notificationRepository.create(handle, data)
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

    async findAllForUser(handle, userId) {
      return await notificationRepository.findAllForUser(handle, userId)
    },

    async getUnreadCountForUser(handle, userId) {
      return await notificationRepository.getUnreadCountForUser(handle, userId)
    },

    async markAsRead(handle, notificationId, userId) {
      await notificationRepository.markAsRead(handle, notificationId, userId)
    },

    async markAllAsRead(handle, userId) {
      await notificationRepository.markAllAsRead(handle, userId)
    },
  }
}
