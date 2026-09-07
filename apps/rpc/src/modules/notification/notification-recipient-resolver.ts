import type { DBHandle } from "@dotkomonline/db"
import { NotFoundError } from "../../error"
import type { UserId } from "../user/user"
import type {
  NotificationRecipientResolution,
  NotificationRecipientSelection,
  NotificationRecipientSelectionPreview,
  NotificationRecipientSelectionRule,
  NotificationType,
} from "./notification"
import type { NotificationRecipientQueryRepository } from "./notification-recipient-query-repository"
import { getNotificationPermissionField } from "./notification-preferences"

const PREVIEW_SAMPLE_SIZE = 50

export interface NotificationRecipientResolver {
  /**
   * Expand recipient selection rules into a de-duplicated recipient list, after exclusions and notification
   * preferences.
   */
  resolve(
    handle: DBHandle,
    recipientSelection: NotificationRecipientSelection,
    notificationType: NotificationType
  ): Promise<NotificationRecipientResolution>
  /**
   * Resolve a recipient selection and return counts plus a small sample of recipients for the UI.
   */
  preview(
    handle: DBHandle,
    recipientSelection: NotificationRecipientSelection,
    notificationType: NotificationType
  ): Promise<NotificationRecipientSelectionPreview>
}

interface RuleMatch {
  label: string
  userIds: UserId[]
}

export function getNotificationRecipientResolver(
  recipientQueryRepository: NotificationRecipientQueryRepository
): NotificationRecipientResolver {
  async function matchRule(handle: DBHandle, rule: NotificationRecipientSelectionRule): Promise<RuleMatch> {
    switch (rule.type) {
      case "ALL_USERS": {
        const userIds = await recipientQueryRepository.findAllUserIds(handle)
        return { label: "Alle brukere", userIds }
      }

      case "USERS": {
        const userIds = await recipientQueryRepository.filterExistingUserIds(handle, rule.userIds)
        return { label: "Valgte personer", userIds }
      }

      case "GROUP_MEMBERS": {
        const members = await recipientQueryRepository.findGroupMemberUserIds(handle, rule.groupSlug, {
          includeFormerMembers: rule.includeFormerMembers,
        })

        if (members === null) {
          throw new NotFoundError(`Group(Slug=${rule.groupSlug}) not found`)
        }

        let label = `Aktive medlemmer av ${members.groupName}`

        if (rule.includeFormerMembers) {
          label = `Nåværende og tidligere medlemmer av ${members.groupName}`
        }

        return { label, userIds: members.userIds }
      }

      case "EVENT_ATTENDEES": {
        const attendees = await recipientQueryRepository.findAttendeeUserIds(handle, rule.attendanceId, {
          includeUnreservedAttendees: rule.includeUnreservedAttendees,
          attendancePoolIds: rule.attendancePoolIds,
        })

        if (attendees === null) {
          throw new NotFoundError(`Attendance(ID=${rule.attendanceId}) not found`)
        }

        let label = `Påmeldte på ${attendees.eventTitle}`

        if (rule.includeUnreservedAttendees) {
          label = `Påmeldte og ventelistede på ${attendees.eventTitle}`
        }

        return { label, userIds: attendees.userIds }
      }
    }
  }

  return {
    async resolve(handle, recipientSelection, notificationType) {
      const matches = await Promise.all(recipientSelection.rules.map((rule) => matchRule(handle, rule)))

      const sourceLabelsByUserId = new Map<UserId, string[]>()
      let matchCount = 0

      for (const match of matches) {
        for (const userId of match.userIds) {
          matchCount += 1
          const existingLabels = sourceLabelsByUserId.get(userId)

          if (existingLabels === undefined) {
            sourceLabelsByUserId.set(userId, [match.label])
          } else {
            existingLabels.push(match.label)
          }
        }
      }

      const duplicateCount = matchCount - sourceLabelsByUserId.size

      const excludedUserIds = new Set(recipientSelection.excludedUserIds)
      let excludedCount = 0

      for (const userId of excludedUserIds) {
        if (sourceLabelsByUserId.delete(userId)) {
          excludedCount += 1
        }
      }

      const candidateUserIds = Array.from(sourceLabelsByUserId.keys())
      const permissionField = getNotificationPermissionField(notificationType)
      let allowedUserIds = candidateUserIds

      // Types mapped to ALWAYS in notification-preferences skip this filter. Missing permission rows are treated as
      // opted in, matching the database defaults.
      if (permissionField !== null) {
        allowedUserIds = await recipientQueryRepository.filterUserIdsByPreference(
          handle,
          candidateUserIds,
          permissionField
        )
      }

      const optedOutCount = candidateUserIds.length - allowedUserIds.length

      const recipients = allowedUserIds.map((userId) => ({
        userId,
        sourceLabels: sourceLabelsByUserId.get(userId) ?? [],
      }))

      return {
        recipients,
        matchCount,
        duplicateCount,
        excludedCount,
        optedOutCount,
      }
    },

    async preview(handle, recipientSelection, notificationType) {
      const { recipients, ...counts } = await this.resolve(handle, recipientSelection, notificationType)

      const sampledRecipients = recipients.slice(0, PREVIEW_SAMPLE_SIZE)
      const summaries = await recipientQueryRepository.findUserSummaries(
        handle,
        sampledRecipients.map((recipient) => recipient.userId)
      )
      const summaryByUserId = new Map(summaries.map((summary) => [summary.id, summary]))

      const sample = sampledRecipients.map((recipient) => {
        const summary = summaryByUserId.get(recipient.userId)

        return {
          ...recipient,
          name: summary?.name ?? null,
          imageUrl: summary?.imageUrl ?? null,
        }
      })

      return {
        ...counts,
        recipientCount: recipients.length,
        sample,
      }
    },
  }
}
