import type { NotificationRecipientSelection, NotificationRecipientSelectionRule } from "@dotkomonline/rpc/notification"

export type NotificationRecipientSelectionRuleDraft =
  | { id: string; type: "ALL_USERS" }
  | { id: string; type: "GROUP_MEMBERS"; groupSlug: string | null; includeFormerMembers: boolean }
  | {
      id: string
      type: "EVENT_ATTENDEES"
      eventId: string | null
      attendanceId: string | null
      includeUnreservedAttendees: boolean
      attendancePoolIds: string[] | null
    }
  | {
      id: string
      type: "USERS"
      users: Array<{ id: string; name: string | null; imageUrl: string | null }>
    }

export type ExcludedNotificationRecipient = {
  userId: string
  name: string | null
  imageUrl: string | null
}

export function createRecipientSelectionRuleDraft(
  type: NotificationRecipientSelectionRuleDraft["type"]
): NotificationRecipientSelectionRuleDraft {
  const id = crypto.randomUUID()

  if (type === "ALL_USERS") {
    return { id, type }
  }

  if (type === "GROUP_MEMBERS") {
    return { id, type, groupSlug: null, includeFormerMembers: false }
  }

  if (type === "EVENT_ATTENDEES") {
    return {
      id,
      type,
      eventId: null,
      attendanceId: null,
      includeUnreservedAttendees: false,
      attendancePoolIds: null,
    }
  }

  return { id, type, users: [] }
}

export function draftToRecipientSelectionRule(
  draft: NotificationRecipientSelectionRuleDraft
): NotificationRecipientSelectionRule | null {
  if (draft.type === "ALL_USERS") {
    return { type: "ALL_USERS" }
  }

  if (draft.type === "GROUP_MEMBERS") {
    if (draft.groupSlug === null) {
      return null
    }

    return {
      type: "GROUP_MEMBERS",
      groupSlug: draft.groupSlug,
      includeFormerMembers: draft.includeFormerMembers,
    }
  }

  if (draft.type === "EVENT_ATTENDEES") {
    if (draft.attendanceId === null) {
      return null
    }

    if (draft.attendancePoolIds !== null && draft.attendancePoolIds.length > 0) {
      return {
        type: "EVENT_ATTENDEES",
        attendanceId: draft.attendanceId,
        includeUnreservedAttendees: draft.includeUnreservedAttendees,
        attendancePoolIds: draft.attendancePoolIds,
      }
    }

    return {
      type: "EVENT_ATTENDEES",
      attendanceId: draft.attendanceId,
      includeUnreservedAttendees: draft.includeUnreservedAttendees,
    }
  }

  if (draft.users.length === 0) {
    return null
  }

  return {
    type: "USERS",
    userIds: draft.users.map((user) => user.id),
  }
}

export function toNotificationRecipientSelection(
  drafts: NotificationRecipientSelectionRuleDraft[],
  excludedRecipients: ExcludedNotificationRecipient[]
): NotificationRecipientSelection | null {
  const rules = drafts.map(draftToRecipientSelectionRule).filter((rule) => rule !== null)

  if (rules.length === 0) {
    return null
  }

  return {
    rules,
    excludedUserIds: excludedRecipients.map((recipient) => recipient.userId),
  }
}

export function createDraftsFromRecipientSelection(
  recipientSelection: NotificationRecipientSelection | null
): NotificationRecipientSelectionRuleDraft[] {
  if (recipientSelection === null) {
    return []
  }

  return recipientSelection.rules.map((rule) => {
    const id = crypto.randomUUID()

    if (rule.type === "ALL_USERS") {
      return { id, type: "ALL_USERS" }
    }

    if (rule.type === "GROUP_MEMBERS") {
      return {
        id,
        type: "GROUP_MEMBERS",
        groupSlug: rule.groupSlug,
        includeFormerMembers: rule.includeFormerMembers,
      }
    }

    if (rule.type === "EVENT_ATTENDEES") {
      return {
        id,
        type: "EVENT_ATTENDEES",
        eventId: null,
        attendanceId: rule.attendanceId,
        includeUnreservedAttendees: rule.includeUnreservedAttendees,
        attendancePoolIds: rule.attendancePoolIds ?? null,
      }
    }

    return {
      id,
      type: "USERS",
      users: rule.userIds.map((userId) => ({
        id: userId,
        name: null,
        imageUrl: null,
      })),
    }
  })
}

export function getRecipientSelectionRuleLabel(type: NotificationRecipientSelectionRuleDraft["type"]): string {
  if (type === "ALL_USERS") {
    return "Alle brukere"
  }

  if (type === "GROUP_MEMBERS") {
    return "Medlemmer av gruppe"
  }

  if (type === "EVENT_ATTENDEES") {
    return "Påmeldte på arrangement"
  }

  return "Enkeltpersoner"
}
