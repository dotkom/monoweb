import { type EventEmitter, on } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { getLogger } from "@dotkomonline/logger"
import { getCurrentUTC, richTextToPlainText, type Pageable } from "@dotkomonline/utils"
import { FailedPreconditionError, InvalidArgumentError, NotFoundError } from "../../error"
import type { GroupId } from "../group/group"
import type { TaskId } from "../task/task"
import type { UserId } from "../user/user"
import { hasCompleteNotificationMessage, NotificationUpdateSchema } from "./notification"
import type {
  Notification,
  NotificationDraftCreate,
  NotificationFilterQuery,
  NotificationGlobalLink,
  NotificationId,
  NotificationManagement,
  NotificationRecipient,
  NotificationRecipientListItem,
  NotificationRecipientFilterQuery,
  NotificationRecipientSelection,
  NotificationRecipientPreviewOptions,
  NotificationRecipientSelectionPreview,
  NotificationRecipientStats,
  NotificationType,
  NotificationSource,
  NotificationUpdate,
  UserNotification,
} from "./notification"
import type { NotificationRecipientResolver } from "./notification-recipient-resolver"
import type { NotificationRepository } from "./notification-repository"
import { getNotificationSourceResolver, type NotificationSourceServices } from "./notification-source-resolver"

export interface NotificationSendInput {
  source: NotificationSource
  type: NotificationType
  title: string
  shortDescription: string
  content?: string
  link?: NotificationGlobalLink
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
  createDraft(
    handle: DBHandle,
    input: NotificationDraftCreate & { createdById: UserId }
  ): Promise<NotificationManagement>
  saveDraftRecipients(
    handle: DBHandle,
    notificationId: NotificationId,
    recipientSelection: NotificationRecipientSelection | null,
    updatedById: UserId
  ): Promise<NotificationManagement>
  sendDraft(
    handle: DBHandle,
    notificationId: NotificationId,
    expectedUpdatedAt: Date,
    updatedById: UserId
  ): Promise<NotificationSendResult>
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
    notificationType: NotificationType,
    page: Pageable,
    search?: string,
    options?: NotificationRecipientPreviewOptions
  ): Promise<NotificationRecipientSelectionPreview>

  findById(handle: DBHandle, notificationId: NotificationId): Promise<NotificationManagement | null>
  getById(handle: DBHandle, notificationId: NotificationId): Promise<NotificationManagement>
  findMany(handle: DBHandle, query: NotificationFilterQuery, page: Pageable): Promise<NotificationManagement[]>
  update(handle: DBHandle, notificationId: NotificationId, data: NotificationUpdate): Promise<NotificationManagement>
  delete(handle: DBHandle, notificationId: NotificationId): Promise<void>

  addRecipients(
    handle: DBHandle,
    notificationId: NotificationId,
    recipientSelection: NotificationRecipientSelection
  ): Promise<number>
  removeRecipients(handle: DBHandle, notificationId: NotificationId, userIds: UserId[]): Promise<number>
  findRecipients(
    handle: DBHandle,
    notificationId: NotificationId,
    filters: NotificationRecipientFilterQuery,
    page: Pageable
  ): Promise<NotificationRecipientListItem[]>
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
  sourceServices: NotificationSourceServices,
  eventEmitter: EventEmitter
): NotificationService {
  const logger = getLogger("notification-service")

  const sourceResolver = getNotificationSourceResolver(sourceServices)

  function toInboxNotification(notification: NotificationManagement): Notification {
    const {
      initialRecipientSelection: _initialRecipientSelection,
      draftRecipientSelection: _draftRecipientSelection,
      ...inboxNotification
    } = notification

    return inboxNotification
  }

  function emitNewNotifications(recipients: NotificationRecipient[], notification: Notification): void {
    for (const recipient of recipients) {
      emitNewNotification(recipient.userId, {
        id: recipient.id,
        readAt: recipient.readAt,
        notification,
      })
    }
  }

  async function deliverNotification(
    handle: DBHandle,
    notification: NotificationManagement,
    userIds: UserId[]
  ): Promise<number> {
    const recipients = await notificationRepository.addRecipients(handle, notification.id, userIds)
    emitNewNotifications(recipients, toInboxNotification(notification))

    return recipients.length
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
    async createDraft(handle, input) {
      const { link, defaultRecipientSelection } = await sourceResolver.resolve(handle, input)
      const draftRecipientSelection = input.recipientSelection ?? defaultRecipientSelection

      return await notificationRepository.create(handle, {
        title: input.title,
        shortDescription: input.shortDescription,
        content: input.content,
        type: input.type,
        link,
        status: "DRAFT",
        sentAt: null,
        actorGroupId: input.actorGroupId,
        createdById: input.createdById,
        taskId: null,
        initialRecipientSelection: null,
        draftRecipientSelection,
      })
    },

    async saveDraftRecipients(handle, notificationId, recipientSelection, updatedById) {
      const notification = await notificationRepository.saveDraftRecipients(
        handle,
        notificationId,
        recipientSelection,
        updatedById
      )

      if (notification === null) {
        throw new FailedPreconditionError("Recipient rules can only be saved on a draft")
      }

      return notification
    },

    async sendDraft(handle, notificationId, expectedUpdatedAt, updatedById) {
      const draft = await this.getById(handle, notificationId)

      if (draft.status !== "DRAFT" || draft.updatedAt.getTime() !== expectedUpdatedAt.getTime()) {
        throw new FailedPreconditionError("The draft has changed or has already been sent. Refresh and try again.")
      }

      if (!hasCompleteNotificationMessage(draft)) {
        throw new InvalidArgumentError("A title and short description are required before sending")
      }

      const recipientSelection = draft.draftRecipientSelection

      if (recipientSelection === null) {
        throw new InvalidArgumentError("Save at least one recipient rule before sending")
      }

      const resolution = await recipientResolver.resolve(handle, recipientSelection, draft.type)
      const recipientUserIds = resolution.recipients.map((recipient) => recipient.userId)

      if (recipientUserIds.length === 0) {
        throw new InvalidArgumentError("The recipient selection does not match any recipients")
      }

      const hasMessageContent = richTextToPlainText(draft.content, null).trim().length > 0
      const content = hasMessageContent ? draft.content : draft.shortDescription

      const notification = await notificationRepository.publishDraft(handle, notificationId, {
        expectedUpdatedAt,
        recipientSelection,
        content,
        sentAt: getCurrentUTC(),
        updatedById,
      })

      if (notification === null) {
        throw new FailedPreconditionError("The draft has changed or has already been sent. Refresh and try again.")
      }

      const recipientCount = await deliverNotification(handle, notification, recipientUserIds)

      return { notification, recipientCount }
    },

    async send(handle, input) {
      const { link } = await sourceResolver.resolve(handle, input)

      const recipientResolution = await recipientResolver.resolve(handle, input.recipientSelection, input.type)

      const notification = await notificationRepository.create(handle, {
        type: input.type,
        title: input.title,
        shortDescription: input.shortDescription,
        content: input.content ?? input.shortDescription,
        link,
        status: "SENT",
        sentAt: getCurrentUTC(),
        draftRecipientSelection: null,
        initialRecipientSelection: input.recipientSelection,
        actorGroupId: input.actorGroupId ?? null,
        createdById: input.createdById ?? null,
        taskId: input.taskId ?? null,
      })

      const recipientUserIds = recipientResolution.recipients.map((recipient) => recipient.userId)
      const recipientCount = await deliverNotification(handle, notification, recipientUserIds)

      logger.info(
        "Sent Notification(ID=%s, Type=%s) to %d recipients",
        notification.id,
        notification.type,
        recipientCount
      )

      return { notification, recipientCount }
    },

    async previewRecipientSelection(handle, recipientSelection, notificationType, page, search, options) {
      return await recipientResolver.preview(handle, recipientSelection, notificationType, page, search, options)
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
      const update = NotificationUpdateSchema.safeParse(data)

      if (!update.success) {
        throw new InvalidArgumentError("Invalid notification update. The link target cannot be changed.")
      }

      const notification = await this.getById(handle, notificationId)

      if (
        notification.status === "SENT" &&
        update.data.shortDescription !== undefined &&
        update.data.shortDescription.trim().length === 0
      ) {
        throw new InvalidArgumentError("Sent notifications must have a short description")
      }

      return await notificationRepository.update(handle, notificationId, update.data)
    },

    async delete(handle, notificationId) {
      await this.getById(handle, notificationId)

      await notificationRepository.delete(handle, notificationId)
    },

    async addRecipients(handle, notificationId, recipientSelection) {
      const notification = await this.getById(handle, notificationId)

      if (notification.status !== "SENT") {
        throw new FailedPreconditionError("Send the draft before adding more recipients")
      }
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
      const recipientCount = await deliverNotification(handle, notification, recipientUserIds)

      logger.info("Added %d recipients to Notification(ID=%s)", recipientCount, notificationId)

      return recipientCount
    },

    async removeRecipients(handle, notificationId, userIds) {
      await this.getById(handle, notificationId)

      return await notificationRepository.removeRecipients(handle, notificationId, userIds)
    },

    async findRecipients(handle, notificationId, filters, page) {
      await this.getById(handle, notificationId)

      return await notificationRepository.findRecipients(handle, notificationId, filters, page)
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
