import type { DBHandle, Prisma } from "@dotkomonline/db"
import { beforeEach, describe, expect, it } from "vitest"
import { mockDeep, mockReset } from "vitest-mock-extended"
import { NotificationRecipientSelectionSchema } from "./notification"
import { getNotificationRepository } from "./notification-repository"

const timestamp = new Date("2026-10-27T12:00:00Z")
type DatabaseNotification = Prisma.NotificationGetPayload<{
  include: { actorGroup: { include: { roles: true } } }
}>

const defaultNotification = {
  id: "default-notification",
  createdAt: timestamp,
  updatedAt: timestamp,
  status: "SENT",
  sentAt: timestamp,
  title: "News",
  shortDescription: "News description",
  content: "News content",
  type: "BROADCAST",
  payloadType: "NONE",
  payload: null,
  actorGroupId: null,
  actorGroup: null,
  createdById: null,
  lastUpdatedById: null,
  taskId: null,
  initialRecipientSelection: null,
  draftRecipientSelection: null,
} satisfies DatabaseNotification

const databaseHandle = mockDeep<DBHandle>()
const repository = getNotificationRepository()

it("only updates message content and attribution, preserving the payload", async () => {
  databaseHandle.notification.update.mockResolvedValue(defaultNotification)
  const changes = {
    title: "Updated",
    lastUpdatedById: "user-one",
    link: { type: "URL", url: "https://example.com" },
    payloadType: "URL",
    payload: "https://example.com",
  }

  const result = await repository.update(databaseHandle, defaultNotification.id, changes)

  expect(databaseHandle.notification.update).toHaveBeenCalledWith(
    expect.objectContaining({
      data: {
        title: "Updated",
        shortDescription: undefined,
        content: undefined,
        lastUpdatedById: "user-one",
      },
    })
  )
  expect(result.link).toEqual({ type: "NONE" })
})

beforeEach(() => {
  mockReset(databaseHandle)
  databaseHandle.notificationRecipient.updateMany.mockResolvedValue({ count: 1 })
})

describe("draft persistence", () => {
  const recipientSelection = NotificationRecipientSelectionSchema.parse({ rules: [{ type: "ALL_USERS" }] })
  const publication = {
    expectedUpdatedAt: timestamp,
    recipientSelection,
    content: "Saved message",
    sentAt: timestamp,
    updatedById: "sender-1",
  }

  it("publishes only the confirmed draft version and stores the original recipient rules", async () => {
    databaseHandle.notification.updateMany.mockResolvedValue({ count: 1 })
    databaseHandle.notification.findUnique.mockResolvedValue({
      ...defaultNotification,
      initialRecipientSelection: recipientSelection,
    })

    const result = await repository.publishDraft(databaseHandle, defaultNotification.id, publication)

    expect(databaseHandle.notification.updateMany).toHaveBeenCalledWith({
      where: { id: defaultNotification.id, status: "DRAFT", updatedAt: timestamp },
      data: expect.objectContaining({
        status: "SENT",
        sentAt: timestamp,
        initialRecipientSelection: recipientSelection,
      }),
    })
    expect(result?.initialRecipientSelection).toEqual(recipientSelection)
  })

  it("does not return a publishable notification when another send or edit won the update", async () => {
    databaseHandle.notification.updateMany.mockResolvedValue({ count: 0 })

    expect(await repository.publishDraft(databaseHandle, defaultNotification.id, publication)).toBeNull()
    expect(databaseHandle.notification.findUnique).not.toHaveBeenCalled()
  })

  it("saves recipient rules only while the notification is a draft", async () => {
    databaseHandle.notification.updateMany.mockResolvedValue({ count: 0 })

    expect(
      await repository.saveDraftRecipients(databaseHandle, defaultNotification.id, recipientSelection, "sender-1")
    ).toBeNull()
    expect(databaseHandle.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: defaultNotification.id, status: "DRAFT" },
      })
    )
    expect(databaseHandle.notificationRecipient.createManyAndReturn).not.toHaveBeenCalled()
  })
})

describe("inbox persistence", () => {
  it("marks all unread sent notifications without checking feedback answers", async () => {
    databaseHandle.notificationRecipient.updateMany.mockResolvedValue({ count: 2 })

    expect(await repository.markAllAsRead(databaseHandle, "user-one")).toBe(2)
    expect(databaseHandle.notificationRecipient.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-one", readAt: null, notification: { status: "SENT" } },
      data: { readAt: expect.any(Date) },
    })
    expect(databaseHandle.feedbackFormAnswer.findMany).not.toHaveBeenCalled()
  })

  it("excludes drafts from the inbox and unread count", async () => {
    databaseHandle.notificationRecipient.findMany.mockResolvedValue([])
    databaseHandle.notificationRecipient.count.mockResolvedValue(0)

    await repository.findManyForUser(databaseHandle, "user-one", { take: 10 })
    await repository.countUnreadForUser(databaseHandle, "user-one")

    expect(databaseHandle.notificationRecipient.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-one", notification: { status: "SENT" } },
        orderBy: [{ notification: { sentAt: "desc" } }, { id: "desc" }],
      })
    )
    expect(databaseHandle.notificationRecipient.count).toHaveBeenCalledWith({
      where: { userId: "user-one", readAt: null, notification: { status: "SENT" } },
    })
  })
})
