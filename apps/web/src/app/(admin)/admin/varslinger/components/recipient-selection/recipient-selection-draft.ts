import { NotificationRecipientSelectionSchema } from "@dotkomonline/rpc/notification"
import type {
  NotificationRecipientAttendanceSelectionOption,
  NotificationRecipientMembershipStatus,
  NotificationRecipientMembershipType,
  NotificationRecipientPaymentStatus,
  NotificationRecipientReservationStatus,
  NotificationRecipientSelection,
  NotificationRecipientSelectionRule,
} from "@dotkomonline/rpc/notification"

export type RecipientRuleDraft =
  | {
      id: string
      type: "ALL_USERS"
      membershipStatus: NotificationRecipientMembershipStatus
      membershipTypes: NotificationRecipientMembershipType[] | null
      studyGrades: number[] | null
      requiresActiveCommitteeMembership: boolean
    }
  | { id: string; type: "GROUP_MEMBERS"; groupSlug: string | null; includeFormerMembers: boolean }
  | {
      id: string
      type: "EVENT_ATTENDEES"
      eventId: string | null
      attendanceId: string | null
      reservationStatus: NotificationRecipientReservationStatus
      paymentStatus: NotificationRecipientPaymentStatus
      attendanceSelectionOptions: NotificationRecipientAttendanceSelectionOption[] | null
    }
  | {
      id: string
      type: "USERS"
      users: Array<{ id: string; name: string | null; imageUrl: string | null }>
    }

export type ExcludedRecipient = {
  userId: string
  name: string | null
  imageUrl: string | null
}

export function getRuleLabel(type: RecipientRuleDraft["type"]): string {
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

export function createRecipientRuleDraft(type: RecipientRuleDraft["type"]): RecipientRuleDraft {
  const id = crypto.randomUUID()

  if (type === "ALL_USERS") {
    return {
      id,
      type,
      membershipStatus: "ACTIVE",
      membershipTypes: null,
      studyGrades: null,
      requiresActiveCommitteeMembership: false,
    }
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
      reservationStatus: "RESERVED",
      paymentStatus: "ALL",
      attendanceSelectionOptions: null,
    }
  }

  return { id, type, users: [] }
}

export function draftToRule(draft: RecipientRuleDraft): NotificationRecipientSelectionRule | null {
  if (draft.type === "ALL_USERS") {
    const rule: Extract<NotificationRecipientSelectionRule, { type: "ALL_USERS" }> = {
      type: "ALL_USERS",
      membershipStatus: draft.membershipStatus,
      requiresActiveCommitteeMembership: draft.requiresActiveCommitteeMembership,
    }

    if (draft.membershipTypes !== null && draft.membershipTypes.length > 0) {
      rule.membershipTypes = draft.membershipTypes
    }

    if (draft.studyGrades !== null && draft.studyGrades.length > 0) {
      rule.studyGrades = draft.studyGrades
    }

    return rule
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

    const rule: Extract<NotificationRecipientSelectionRule, { type: "EVENT_ATTENDEES" }> = {
      type: "EVENT_ATTENDEES",
      attendanceId: draft.attendanceId,
      reservationStatus: draft.reservationStatus,
      paymentStatus: draft.paymentStatus,
    }

    if (draft.attendanceSelectionOptions !== null && draft.attendanceSelectionOptions.length > 0) {
      rule.attendanceSelectionOptions = draft.attendanceSelectionOptions
    }

    return rule
  }

  if (draft.users.length === 0) {
    return null
  }

  return {
    type: "USERS",
    userIds: draft.users.map((user) => user.id),
  }
}

export function toRecipientSelection(
  drafts: RecipientRuleDraft[],
  excludedRecipients: ExcludedRecipient[]
): NotificationRecipientSelection | null {
  const rules = drafts.map(draftToRule).filter((rule) => rule !== null)

  if (rules.length === 0) {
    return null
  }

  return {
    rules,
    excludedUserIds: excludedRecipients.map((recipient) => recipient.userId),
  }
}

export function draftsFromRecipientSelection(
  recipientSelection: NotificationRecipientSelection | null
): RecipientRuleDraft[] {
  if (recipientSelection === null) {
    return []
  }

  return recipientSelection.rules.map((rule) => {
    const id = crypto.randomUUID()

    if (rule.type === "ALL_USERS") {
      return {
        id,
        type: "ALL_USERS" as const,
        membershipStatus: rule.membershipStatus,
        membershipTypes: rule.membershipTypes ?? null,
        studyGrades: rule.studyGrades ?? null,
        requiresActiveCommitteeMembership: rule.requiresActiveCommitteeMembership,
      }
    }

    if (rule.type === "GROUP_MEMBERS") {
      return {
        id,
        type: "GROUP_MEMBERS" as const,
        groupSlug: rule.groupSlug,
        includeFormerMembers: rule.includeFormerMembers,
      }
    }

    if (rule.type === "EVENT_ATTENDEES") {
      return {
        id,
        type: "EVENT_ATTENDEES" as const,
        eventId: null,
        attendanceId: rule.attendanceId,
        reservationStatus: rule.reservationStatus,
        paymentStatus: rule.paymentStatus,
        attendanceSelectionOptions: rule.attendanceSelectionOptions ?? null,
      }
    }

    return {
      id,
      type: "USERS" as const,
      users: rule.userIds.map((userId) => ({
        id: userId,
        name: null,
        imageUrl: null,
      })),
    }
  })
}

export interface RecipientSelectionDraft {
  rules: RecipientRuleDraft[]
  excludedRecipients: ExcludedRecipient[]
}

export function createRecipientSelectionDraft(
  selection: NotificationRecipientSelection | null
): RecipientSelectionDraft {
  return {
    rules: draftsFromRecipientSelection(selection),
    excludedRecipients: (selection?.excludedUserIds ?? []).map((userId) => ({ userId, name: null, imageUrl: null })),
  }
}

export function hasIncompleteRecipientRules(draft: RecipientSelectionDraft): boolean {
  return draft.rules.some((rule) => draftToRule(rule) === null)
}

export function getRecipientSelection(draft: RecipientSelectionDraft): NotificationRecipientSelection | null {
  return toRecipientSelection(draft.rules, draft.excludedRecipients)
}

export function getRecipientSelectionKey(selection: NotificationRecipientSelection | null): string {
  if (selection === null) {
    return "null"
  }

  return JSON.stringify(NotificationRecipientSelectionSchema.parse(selection))
}
