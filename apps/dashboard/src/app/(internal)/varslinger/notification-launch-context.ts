import type { Attendance } from "@dotkomonline/rpc/attendance"
import type { Event } from "@dotkomonline/rpc/event"
import type { NotificationAudience, NotificationLink } from "@dotkomonline/rpc/notification"

export type NotificationLaunchContext =
  | {
      kind: "EVENT"
      eventId: string
      attendanceId: string
      eventTitle: string
      hostingGroupSlugs: string[]
      pools: Array<{ id: string; title: string }>
    }
  | {
      kind: "GROUP"
      groupSlug: string
      groupName: string
    }
  | {
      kind: "GLOBAL"
    }

export function getDefaultNotificationTitle(launchContext: NotificationLaunchContext): string {
  if (launchContext.kind === "EVENT") {
    return `Melding om ${launchContext.eventTitle}`
  }

  if (launchContext.kind === "GROUP") {
    return `Melding fra ${launchContext.groupName}`
  }

  return ""
}

export function getDefaultNotificationLink(launchContext: NotificationLaunchContext): NotificationLink {
  if (launchContext.kind === "EVENT") {
    return { type: "EVENT", eventId: launchContext.eventId }
  }

  if (launchContext.kind === "GROUP") {
    return { type: "GROUP", groupSlug: launchContext.groupSlug }
  }

  return { type: "NONE" }
}

export function getDefaultAudience(launchContext: NotificationLaunchContext): NotificationAudience | null {
  if (launchContext.kind === "EVENT") {
    return {
      rules: [
        {
          type: "EVENT_ATTENDEES",
          attendanceId: launchContext.attendanceId,
          includeUnreservedAttendees: false,
        },
      ],
      excludedUserIds: [],
    }
  }

  if (launchContext.kind === "GROUP") {
    return {
      rules: [
        {
          type: "GROUP_MEMBERS",
          groupSlug: launchContext.groupSlug,
          includeInactiveMembers: false,
        },
      ],
      excludedUserIds: [],
    }
  }

  return null
}

export function getEventLaunchContext(
  event: Pick<Event, "id" | "title" | "hostingGroups">,
  attendance: Pick<Attendance, "id" | "pools">
): Extract<NotificationLaunchContext, { kind: "EVENT" }> {
  return {
    kind: "EVENT",
    eventId: event.id,
    attendanceId: attendance.id,
    eventTitle: event.title,
    hostingGroupSlugs: event.hostingGroups.map((group) => group.slug),
    pools: attendance.pools.map((pool) => ({ id: pool.id, title: pool.title })),
  }
}

export function getSendNotificationModalTitle(launchContext: NotificationLaunchContext): string {
  if (launchContext.kind === "EVENT") {
    return "Send melding til påmeldte"
  }

  if (launchContext.kind === "GROUP") {
    return "Send melding til medlemmer"
  }

  return "Ny varsling"
}
