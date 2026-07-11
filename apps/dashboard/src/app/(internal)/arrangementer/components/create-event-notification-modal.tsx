"use client"

import type { NotificationType } from "@dotkomonline/rpc"
import type { AttendanceId } from "@dotkomonline/rpc/attendance"
import { openCreateNotificationModal } from "@/app/(internal)/varslinger/create-modal/CreateNotificationModal"
import {
  createEventLaunchContext,
  type ActorGroupOption,
} from "@/app/(internal)/varslinger/create-modal/types"

interface OpenCreateEventNotificationModalInput {
  eventId: string
  eventTitle: string
  eventPath: string
  attendanceId?: AttendanceId
  type: NotificationType
  hostingGroups: ActorGroupOption[]
  eligibleGroupSlugs: string[]
  attendanceMembers?: Array<{ userId: string; name: string | null; reserved: boolean }>
}

export function openCreateEventNotificationModal(input: OpenCreateEventNotificationModalInput) {
  openCreateNotificationModal(
    createEventLaunchContext({
      eventId: input.eventId,
      eventTitle: input.eventTitle,
      eventPath: input.eventPath,
      type: input.type,
      hostingGroups: input.hostingGroups,
      eligibleGroupSlugs: input.eligibleGroupSlugs,
      attendanceMembers: input.attendanceMembers,
    })
  )
}
