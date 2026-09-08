"use client"

import { getActiveGroupMembership } from "@dotkomonline/rpc/group"
import type { GroupMember } from "@dotkomonline/rpc/group"
import { openCreateNotificationModal } from "@/app/(internal)/varslinger/create-modal/CreateNotificationModal"
import { createGroupLaunchContext } from "@/app/(internal)/varslinger/create-modal/types"

interface OpenCreateGroupNotificationModalInput {
  groupSlug: string
  groupLabel: string
  members: Map<string, GroupMember>
}

export function openCreateGroupNotificationModal({
  groupSlug,
  groupLabel,
  members,
}: OpenCreateGroupNotificationModalInput) {
  const audienceMembers = Array.from(members.entries()).map(([userId, member]) => ({
    userId,
    name: member.name,
    isActive: getActiveGroupMembership(member, groupSlug) !== null,
  }))

  openCreateNotificationModal(
    createGroupLaunchContext({
      groupSlug,
      groupLabel,
      members: audienceMembers,
    })
  )
}
