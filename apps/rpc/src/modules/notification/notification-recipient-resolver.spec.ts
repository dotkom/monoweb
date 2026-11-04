import type { DBHandle } from "@dotkomonline/db"
import { beforeEach, describe, expect, it } from "vitest"
import { mock, mockReset } from "vitest-mock-extended"
import type { NotificationRecipientSelection } from "./notification"
import type { NotificationRecipientQueryRepository } from "./notification-recipient-query-repository"
import { getNotificationRecipientResolver } from "./notification-recipient-resolver"

const databaseHandle = mock<DBHandle>()
const repository = mock<NotificationRecipientQueryRepository>()
const resolver = getNotificationRecipientResolver(repository)
const selection: NotificationRecipientSelection = {
  rules: [
    { type: "GROUP_MEMBERS", groupSlug: "group-1", includeFormerMembers: false },
    { type: "GROUP_MEMBERS", groupSlug: "group-2", includeFormerMembers: false },
  ],
  excludedUserIds: [],
}

beforeEach(() => {
  mockReset(repository)
  repository.findGroupMemberUserIds.mockImplementation(async (_handle, groupSlug) => {
    const userIds = groupSlug === "group-1" ? ["user-1", "user-2"] : ["user-1", "user-3"]

    return { groupName: "Same name", userIds }
  })
  repository.filterUserIdsByPreference.mockImplementation(async (_handle, userIds) => userIds)
})

describe("recipient source rule indexes", () => {
  it("filters saved recipients before paginating and counts only new recipients", async () => {
    repository.findSavedRecipientUserIds.mockResolvedValue(["user-1", "user-2"])
    repository.findUserSummaries.mockResolvedValue([{ id: "user-3", name: "New user", imageUrl: null }])

    const result = await resolver.preview(databaseHandle, selection, "BROADCAST", { take: 1 }, "New", {
      notificationId: "notification-1",
      hideExistingRecipients: true,
    })

    expect(repository.findSavedRecipientUserIds).toHaveBeenCalledWith(databaseHandle, "notification-1")
    expect(repository.findUserSummaries).toHaveBeenCalledWith(databaseHandle, ["user-3"], {
      nameContains: "New",
      take: 1,
      cursor: undefined,
    })
    expect(result.recipientCount).toBe(1)
    expect(result.sample).toEqual([expect.objectContaining({ userId: "user-3", isExistingRecipient: false })])
    expect(result.nextCursor).toBe("user-3")
  })

  it("marks saved recipients when they are included in the preview", async () => {
    repository.findSavedRecipientUserIds.mockResolvedValue(["user-1"])
    repository.findUserSummaries.mockResolvedValue([
      { id: "user-1", name: "Saved user", imageUrl: null },
      { id: "user-3", name: "New user", imageUrl: null },
    ])

    const result = await resolver.preview(databaseHandle, selection, "BROADCAST", { take: 20 }, undefined, {
      notificationId: "notification-1",
      hideExistingRecipients: false,
    })

    expect(result.recipientCount).toBe(3)
    expect(result.sample).toEqual([
      expect.objectContaining({ userId: "user-1", isExistingRecipient: true }),
      expect.objectContaining({ userId: "user-3", isExistingRecipient: false }),
    ])
  })

  it("keeps overlapping rules distinct even when their labels are identical", async () => {
    const result = await resolver.resolve(databaseHandle, selection, "BROADCAST")

    expect(result.recipients).toEqual([
      {
        userId: "user-1",
        sourceLabels: ["Aktive medlemmer av Same name", "Aktive medlemmer av Same name"],
        sourceRuleIndexes: [0, 1],
      },
      {
        userId: "user-2",
        sourceLabels: ["Aktive medlemmer av Same name"],
        sourceRuleIndexes: [0],
      },
      {
        userId: "user-3",
        sourceLabels: ["Aktive medlemmer av Same name"],
        sourceRuleIndexes: [1],
      },
    ])
    expect(result.duplicateCount).toBe(1)
  })

  it("preserves source indexes when exclusions and preferences remove recipients", async () => {
    repository.filterUserIdsByPreference.mockResolvedValue(["user-1"])

    const result = await resolver.resolve(databaseHandle, { ...selection, excludedUserIds: ["user-2"] }, "BROADCAST")

    expect(result.recipients).toEqual([expect.objectContaining({ userId: "user-1", sourceRuleIndexes: [0, 1] })])
    expect(result.excludedCount).toBe(1)
    expect(result.optedOutCount).toBe(1)
  })

  it("attaches source indexes to the correct users in paginated search results", async () => {
    repository.findUserSummaries.mockResolvedValue([
      { id: "user-3", name: "Third user", imageUrl: null },
      { id: "user-1", name: "First user", imageUrl: null },
    ])

    const result = await resolver.preview(databaseHandle, selection, "BROADCAST", { take: 2 }, "user")

    expect(result.sample).toEqual([
      expect.objectContaining({ userId: "user-3", sourceRuleIndexes: [1] }),
      expect.objectContaining({ userId: "user-1", sourceRuleIndexes: [0, 1] }),
    ])
    expect(result.recipientCount).toBe(3)
    expect(result.nextCursor).toBe("user-1")
  })
})
