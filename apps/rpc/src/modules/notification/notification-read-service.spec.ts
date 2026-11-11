import { EventEmitter } from "node:events"
import type { DBHandle } from "@dotkomonline/db"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { mockDeep, mockReset } from "vitest-mock-extended"
import type { EmailService } from "../email/email-service"
import type { NotificationManagement } from "./notification"
import { DEFAULT_NOTIFICATION_DELIVERY, NotificationTypeSchema } from "./notification"
import type { NotificationRecipientResolver } from "./notification-recipient-resolver"
import type { NotificationRepository } from "./notification-repository"
import { getNotificationService, NEW_NOTIFICATION_EVENT } from "./notification-service"
import type { NotificationSettingsService } from "./notification-settings-service"
import type { NotificationSourceServices } from "./notification-source-resolver"

const databaseHandle = mockDeep<DBHandle>()
const repository = mockDeep<NotificationRepository>()
const recipientResolver = mockDeep<NotificationRecipientResolver>()
const eventEmitter = new EventEmitter()
const sourceServices = mockDeep<NotificationSourceServices>()
const emailService = mockDeep<EmailService>()
const settingsService = mockDeep<NotificationSettingsService>()
const service = getNotificationService(
  repository,
  recipientResolver,
  sourceServices,
  eventEmitter,
  emailService,
  "https://example.com",
  settingsService
)
const timestamp = new Date("2026-10-30T12:00:00Z")
const notification: NotificationManagement = {
  id: "feedback",
  type: "NEW_FEEDBACK_FORM",
  title: "Feedback",
  shortDescription: "Tell us about the event",
  content: "Feedback",
  createdAt: timestamp,
  updatedAt: timestamp,
  status: "SENT",
  sentAt: timestamp,
  link: { type: "URL", url: "https://online.ntnu.no/tilbakemelding/event-one" },
  actorGroupId: null,
  actorGroup: null,
  createdById: null,
  lastUpdatedById: null,
  taskId: null,
  initialRecipientSelection: null,
  draftRecipientSelection: null,
}

beforeEach(() => {
  mockReset(databaseHandle)
  mockReset(repository)
  mockReset(recipientResolver)
  mockReset(settingsService)
  settingsService.findManyByUserIds.mockImplementation(async (_handle, userIds) => {
    return new Map(userIds.map((userId) => [userId, { ...DEFAULT_NOTIFICATION_DELIVERY }]))
  })
  settingsService.getEnabledNotificationTypes.mockResolvedValue(NotificationTypeSchema.options)
  repository.findRecipientEmails.mockResolvedValue([])
  eventEmitter.removeAllListeners()
})

describe("default feedback notification behavior", () => {
  it("marks feedback notifications as read without checking for an answer", async () => {
    repository.markAsRead.mockResolvedValue(true)

    expect(await service.markAsRead(databaseHandle, notification.id, "user-one")).toBe(true)
    expect(repository.markAsRead).toHaveBeenCalledWith(databaseHandle, notification.id, "user-one")
    expect(databaseHandle.feedbackFormAnswer.findMany).not.toHaveBeenCalled()
  })

  it("includes feedback notifications in ordinary bulk read updates", async () => {
    repository.markAllAsRead.mockResolvedValue(2)

    expect(await service.markAllAsRead(databaseHandle, "user-one")).toBe(2)
    expect(repository.markAllAsRead).toHaveBeenCalledWith(databaseHandle, "user-one")
    expect(databaseHandle.feedbackFormAnswer.findMany).not.toHaveBeenCalled()
  })

  it("sends feedback as an ordinary URL notification", async () => {
    repository.create.mockResolvedValue(notification)
    repository.addRecipients.mockResolvedValue([
      { id: "recipient", notificationId: notification.id, userId: "user-one", readAt: null },
    ])
    recipientResolver.resolve.mockResolvedValue({
      recipients: [{ userId: "user-one", sourceLabels: ["User"], sourceRuleIndexes: [0] }],
      matchCount: 1,
      duplicateCount: 0,
      excludedCount: 0,
      optedOutCount: 0,
    })
    const receiveNotification = vi.fn()
    eventEmitter.on(NEW_NOTIFICATION_EVENT, receiveNotification)

    await service.send(databaseHandle, {
      source: { type: "GLOBAL" },
      type: "NEW_FEEDBACK_FORM",
      title: notification.title,
      shortDescription: notification.shortDescription,
      link: { type: "URL", url: "https://online.ntnu.no/tilbakemelding/event-one" },
      recipientSelection: { rules: [{ type: "USERS", userIds: ["user-one"] }], excludedUserIds: [] },
    })

    expect(repository.create).toHaveBeenCalledWith(databaseHandle, expect.objectContaining({ link: notification.link }))
    expect(receiveNotification).toHaveBeenCalledWith({
      userId: "user-one",
      userNotification: {
        id: "recipient",
        readAt: null,
        notification: expect.objectContaining({ link: notification.link }),
      },
    })
    expect(databaseHandle.feedbackFormAnswer.findMany).not.toHaveBeenCalled()
  })
})
