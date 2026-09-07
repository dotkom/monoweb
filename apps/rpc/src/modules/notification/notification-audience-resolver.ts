import type { DBHandle } from "@dotkomonline/db"
import { NotFoundError } from "../../error"
import type { UserId } from "../user/user"
import type {
  NotificationAudience,
  NotificationAudiencePreview,
  NotificationAudienceRule,
  NotificationType,
  ResolvedAudience,
} from "./notification"
import type { NotificationAudienceRepository } from "./notification-audience-repository"
import { getNotificationPermissionField } from "./notification-preferences"

const PREVIEW_SAMPLE_SIZE = 50

export interface NotificationAudienceResolver {
  /**
   * Expand audience rules into a de-duplicated recipient list, after exclusions and notification preferences.
   */
  resolve(
    handle: DBHandle,
    audience: NotificationAudience,
    notificationType: NotificationType
  ): Promise<ResolvedAudience>
  /**
   * Resolve an audience and return counts plus a small sample of recipients for the UI.
   */
  preview(
    handle: DBHandle,
    audience: NotificationAudience,
    notificationType: NotificationType
  ): Promise<NotificationAudiencePreview>
}

interface RuleMatch {
  label: string
  userIds: UserId[]
}

export function getNotificationAudienceResolver(
  audienceRepository: NotificationAudienceRepository
): NotificationAudienceResolver {
  async function matchRule(handle: DBHandle, rule: NotificationAudienceRule): Promise<RuleMatch> {
    switch (rule.type) {
      case "ALL_USERS": {
        const userIds = await audienceRepository.findAllUserIds(handle)
        return { label: "Alle brukere", userIds }
      }

      case "USERS": {
        const userIds = await audienceRepository.filterExistingUserIds(handle, rule.userIds)
        return { label: "Valgte personer", userIds }
      }

      case "GROUP_MEMBERS": {
        const members = await audienceRepository.findGroupMemberUserIds(handle, rule.groupSlug, {
          includeInactiveMembers: rule.includeInactiveMembers,
        })

        if (members === null) {
          throw new NotFoundError(`Group(Slug=${rule.groupSlug}) not found`)
        }

        const label = rule.includeInactiveMembers
          ? `Alle medlemmer av ${members.groupName}`
          : `Aktive medlemmer av ${members.groupName}`

        return { label, userIds: members.userIds }
      }

      case "EVENT_ATTENDEES": {
        const attendees = await audienceRepository.findAttendeeUserIds(handle, rule.attendanceId, {
          includeUnreservedAttendees: rule.includeUnreservedAttendees,
          attendancePoolIds: rule.attendancePoolIds,
        })

        if (attendees === null) {
          throw new NotFoundError(`Attendance(ID=${rule.attendanceId}) not found`)
        }

        const label = rule.includeUnreservedAttendees
          ? `Påmeldte og ventelistede på ${attendees.eventTitle}`
          : `Påmeldte på ${attendees.eventTitle}`

        return { label, userIds: attendees.userIds }
      }
    }
  }

  return {
    async resolve(handle, audience, notificationType) {
      const matches = await Promise.all(audience.rules.map((rule) => matchRule(handle, rule)))

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

      const excludedUserIds = new Set(audience.excludedUserIds)
      let excludedCount = 0

      for (const userId of excludedUserIds) {
        if (sourceLabelsByUserId.delete(userId)) {
          excludedCount += 1
        }
      }

      const candidateUserIds = Array.from(sourceLabelsByUserId.keys())
      const permissionField = getNotificationPermissionField(notificationType)

      // Types mapped to ALWAYS in notification-preferences skip this filter. Missing permission rows are treated as
      // opted in, matching the database defaults.
      const allowedUserIds =
        permissionField === null
          ? candidateUserIds
          : await audienceRepository.filterUserIdsByPreference(handle, candidateUserIds, permissionField)

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

    async preview(handle, audience, notificationType) {
      const { recipients, ...counts } = await this.resolve(handle, audience, notificationType)

      const sampledRecipients = recipients.slice(0, PREVIEW_SAMPLE_SIZE)
      const summaries = await audienceRepository.findUserSummaries(
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
