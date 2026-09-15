import { type EventEmitter, on } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import type { Pageable } from "@dotkomonline/utils"
import { NotFoundError } from "../../error"
import type { GroupId } from "../group/group"
import type { TaskId } from "../task/task"
import type { UserId } from "../user/user"
import type {
  Notification,
  NotificationFilterQuery,
  NotificationId,
  NotificationLink,
  NotificationManagement,
  NotificationRecipient,
  NotificationRecipientListItem,
  NotificationRecipientSelection,
  NotificationRecipientSelectionPreview,
  NotificationRecipientStats,
  NotificationType,
  NotificationUpdate,
  UserNotification,
} from "./notification"
import type { NotificationRecipientResolver } from "./notification-recipient-resolver"
import type { NotificationRepository } from "./notification-repository"

export interface NotificationSendInput {
  type: NotificationType
  title: string
  shortDescription: string
  content?: string
  link?: NotificationLink
  recipientSelection: NotificationRecipientSelection
  actorGroupId?: GroupId | null
  createdById?: UserId | null
  taskId?: TaskId | null
}

export interface NotificationSendResult {
  notification: NotificationManagement
  recipientCount: number
}

export const NEW_NOTIFICATION_EVENT = "notification:new"

export interface NewNotificationEvent {
  userId: UserId
  userNotification: UserNotification
}

export interface NotificationService {
  /**
   * Create a notification and materialize its recipients from the given recipient selection.
   *
   * Recipients are a snapshot of who matched at send time. People who later join a targeted group or event are not
   * added automatically.
   */
  send(handle: DBHandle, input: NotificationSendInput): Promise<NotificationSendResult>
  /**
   * Resolve a recipient selection without writing anything, so the UI can show who would be notified.
   */
  previewRecipientSelection(
    handle: DBHandle,
    recipientSelection: NotificationRecipientSelection,
    notificationType: NotificationType
  ): Promise<NotificationRecipientSelectionPreview>

  findById(handle: DBHandle, notificationId: NotificationId): Promise<NotificationManagement | null>
  /**
   * Get a notification by its id.
   *
   * @throws {NotFoundError} if the notification does not exist
   */
  getById(handle: DBHandle, notificationId: NotificationId): Promise<NotificationManagement>
  findMany(handle: DBHandle, query: NotificationFilterQuery, page: Pageable): Promise<NotificationManagement[]>
  /**
   * Update a notification by its id.
   *
   * This mutates the live notification row. Inbox reads join that row, so recipients will see the new title and
   * content on the next fetch. Already-pushed subscription payloads are not rewritten.
   *
   * @throws {NotFoundError} if the notification does not exist
   */
  update(handle: DBHandle, notificationId: NotificationId, data: NotificationUpdate): Promise<NotificationManagement>
  /**
   * Delete a notification by its id.
   *
   * Recipient rows cascade, so the notification disappears from every inbox.
   *
   * @throws {NotFoundError} if the notification does not exist
   */
  delete(handle: DBHandle, notificationId: NotificationId): Promise<void>

  /**
   * Resolve a recipient selection and insert any new recipients for an existing notification.
   *
   * Users who already have a recipient row are skipped. This is an explicit expansion, not a catch-up of the original
   * send. Exclusions from the initial recipient selection are always applied, even if the caller omits them.
   *
   * @throws {NotFoundError} if the notification does not exist
   */
  addRecipients(
    handle: DBHandle,
    notificationId: NotificationId,
    recipientSelection: NotificationRecipientSelection
  ): Promise<number>
  /**
   * Remove recipients from a notification.
   *
   * @throws {NotFoundError} if the notification does not exist
   */
  removeRecipients(handle: DBHandle, notificationId: NotificationId, userIds: UserId[]): Promise<number>
  /**
   * List recipients for a notification.
   *
   * @throws {NotFoundError} if the notification does not exist
   */
  findRecipients(
    handle: DBHandle,
    notificationId: NotificationId,
    page: Pageable
  ): Promise<NotificationRecipientListItem[]>
  /**
   * Count total, read, and unread recipients for a notification.
   *
   * @throws {NotFoundError} if the notification does not exist
   */
  getRecipientStats(handle: DBHandle, notificationId: NotificationId): Promise<NotificationRecipientStats>

  findManyForUser(handle: DBHandle, userId: UserId, page: Pageable): Promise<UserNotification[]>
  countUnreadForUser(handle: DBHandle, userId: UserId): Promise<number>

  markAsRead(handle: DBHandle, notificationId: NotificationId, userId: UserId): Promise<boolean>
  markAllAsRead(handle: DBHandle, userId: UserId): Promise<number>

  subscribeToNewNotifications(userId: UserId, signal?: AbortSignal): AsyncIterable<UserNotification>
}

export function getNotificationService(
  notificationRepository: NotificationRepository,
  recipientResolver: NotificationRecipientResolver,
  eventEmitter: EventEmitter
): NotificationService {
  const logger = getLogger("notification-service")

  function toInboxNotification(notification: NotificationManagement): Notification {
    const { initialRecipientSelection: _initialRecipientSelection, ...inboxNotification } = notification

    return inboxNotification
  }

  function toUserNotification(recipient: NotificationRecipient, notification: Notification): UserNotification {
    return {
      id: recipient.id,
      readAt: recipient.readAt,
      notification,
    }
  }

  function mergeRecipientSelectionExclusions(
    initialRecipientSelection: NotificationRecipientSelection | null,
    incomingRecipientSelection: NotificationRecipientSelection
  ): NotificationRecipientSelection {
    const initiallyExcludedUserIds = initialRecipientSelection?.excludedUserIds ?? []
    const excludedUserIds = [...new Set([...initiallyExcludedUserIds, ...incomingRecipientSelection.excludedUserIds])]

    return {
      ...incomingRecipientSelection,
      excludedUserIds,
    }
  }

  function emitNewNotification(userId: UserId, userNotification: UserNotification): void {
    const event: NewNotificationEvent = { userId, userNotification }

    eventEmitter.emit(NEW_NOTIFICATION_EVENT, event)
  }

  return {
    async send(handle, input) {
      const recipientResolution = await recipientResolver.resolve(handle, input.recipientSelection, input.type)

      const notification = await notificationRepository.create(handle, {
        type: input.type,
        title: input.title,
        shortDescription: input.shortDescription,
        content: input.content ?? input.shortDescription,
        link: input.link ?? { type: "NONE" },
        initialRecipientSelection: input.recipientSelection,
        actorGroupId: input.actorGroupId ?? null,
        createdById: input.createdById ?? null,
        taskId: input.taskId ?? null,
      })

      const recipientUserIds = recipientResolution.recipients.map((recipient) => recipient.userId)
      const recipients = await notificationRepository.addRecipients(handle, notification.id, recipientUserIds)

      logger.info(
        "Sent Notification(ID=%s, Type=%s) to %d recipients",
        notification.id,
        notification.type,
        recipients.length
      )

      const inboxNotification = toInboxNotification(notification)

      for (const recipient of recipients) {
        emitNewNotification(recipient.userId, toUserNotification(recipient, inboxNotification))
      }

      return {
        notification,
        recipientCount: recipients.length,
      }
    },

    async previewRecipientSelection(handle, recipientSelection, notificationType) {
      return await recipientResolver.preview(handle, recipientSelection, notificationType)
    },

    async findById(handle, notificationId) {
      return await notificationRepository.findById(handle, notificationId)
    },

    async getById(handle, notificationId) {
      const notification = await this.findById(handle, notificationId)

      if (notification === null) {
        throw new NotFoundError(`Notification(ID=${notificationId}) not found`)
      }

      return notification
    },

    async findMany(handle, query, page) {
      return await notificationRepository.findMany(handle, query, page)
    },

    async update(handle, notificationId, data) {
      await this.getById(handle, notificationId)

      return await notificationRepository.update(handle, notificationId, data)
    },

    async delete(handle, notificationId) {
      await this.getById(handle, notificationId)

      await notificationRepository.delete(handle, notificationId)
    },

    async addRecipients(handle, notificationId, recipientSelection) {
      const notification = await this.getById(handle, notificationId)
      const recipientSelectionWithInitialExclusions = mergeRecipientSelectionExclusions(
        notification.initialRecipientSelection,
        recipientSelection
      )
      const recipientResolution = await recipientResolver.resolve(
        handle,
        recipientSelectionWithInitialExclusions,
        notification.type
      )

      const recipientUserIds = recipientResolution.recipients.map((recipient) => recipient.userId)
      const addedRecipients = await notificationRepository.addRecipients(handle, notificationId, recipientUserIds)

      logger.info("Added %d recipients to Notification(ID=%s)", addedRecipients.length, notificationId)

      const inboxNotification = toInboxNotification(notification)

      for (const recipient of addedRecipients) {
        emitNewNotification(recipient.userId, toUserNotification(recipient, inboxNotification))
      }

      return addedRecipients.length
    },

    async removeRecipients(handle, notificationId, userIds) {
      await this.getById(handle, notificationId)

      return await notificationRepository.removeRecipients(handle, notificationId, userIds)
    },

    async findRecipients(handle, notificationId, page) {
      await this.getById(handle, notificationId)

      return await notificationRepository.findRecipients(handle, notificationId, page)
    },

    async getRecipientStats(handle, notificationId) {
      await this.getById(handle, notificationId)

      return await notificationRepository.getRecipientStats(handle, notificationId)
    },

    async findManyForUser(handle, userId, page) {
      return await notificationRepository.findManyForUser(handle, userId, page)
    },

    async countUnreadForUser(handle, userId) {
      return await notificationRepository.countUnreadForUser(handle, userId)
    },

    async markAsRead(handle, notificationId, userId) {
      return await notificationRepository.markAsRead(handle, notificationId, userId)
    },

    async markAllAsRead(handle, userId) {
      return await notificationRepository.markAllAsRead(handle, userId)
    },

    async *subscribeToNewNotifications(userId, signal) {
      for await (const [event] of on(eventEmitter, NEW_NOTIFICATION_EVENT, { signal })) {
        const newNotificationEvent = event as NewNotificationEvent

        if (newNotificationEvent.userId !== userId) {
          continue
        }

        yield newNotificationEvent.userNotification
      }
    },
  }
}
