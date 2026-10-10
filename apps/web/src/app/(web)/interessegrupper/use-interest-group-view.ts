"use client"

import { useToggleInterestGroupMembership } from "@/app/sidequests/use-toggle-interest-group-membership"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import {
  GroupRoleTypeEnum,
  canEndInterestGroupMemberships,
  getActiveMembershipsForGroup,
  hasGroupMembershipRoleType,
  type Group,
  type GroupMember,
} from "@dotkomonline/rpc/group"
import type { UserId } from "@dotkomonline/rpc/user"

interface Props {
  interestGroup: Group
  groupMembers: Map<UserId, GroupMember> | undefined
  /**
   * Used until `useAuthenticatedUser` resolves.
   * */
  initialUserId?: UserId
}

export const useInterestGroupView = ({ interestGroup, groupMembers, initialUserId }: Props) => {
  const { dbUser } = useAuthenticatedUser()
  const userId = dbUser?.id ?? initialUserId
  const user = dbUser ?? undefined

  const groupMemberships =
    userId !== undefined && groupMembers !== undefined ? (groupMembers.get(userId)?.groupMemberships ?? []) : []
  const activeMemberships = getActiveMembershipsForGroup(groupMemberships, interestGroup.slug)
  const isMember = activeMemberships.length > 0
  const isLeader = activeMemberships.some((membership) =>
    hasGroupMembershipRoleType(membership, GroupRoleTypeEnum.LEADER)
  )
  const canLeave = canEndInterestGroupMemberships(groupMemberships, interestGroup)
  const toggleMembership = useToggleInterestGroupMembership(groupMemberships)

  return {
    user,
    userId: userId,
    isLoggedIn: userId !== undefined,
    isMember,
    isLeader,
    canLeave,
    memberships: groupMemberships,
    toggleMembership,
  }
}
