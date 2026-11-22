"use client"

import { useToggleInterestGroupMembership } from "@/app/sidequests/use-toggle-interest-group-membership"
import { useTRPC } from "@/utils/trpc/client"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import {
  GroupRoleTypeEnum,
  canEndInterestGroupMembership,
  findActiveGroupMembershipIn,
  hasGroupMembershipRoleType,
  type Group,
  type GroupMember,
} from "@dotkomonline/rpc/group"
import type { UserId } from "@dotkomonline/rpc/user"
import { useQuery } from "@tanstack/react-query"
import { canAccessInterestGroupAdmin } from "./can-access-interest-group-admin"

interface Props {
  interestGroup: Group
  groupMembers: Map<UserId, GroupMember> | undefined
  /**
   * Used until `useAuthenticatedUser` resolves.
   * */
  initialUserId?: UserId
}

export const useInterestGroupView = ({ interestGroup, groupMembers, initialUserId }: Props) => {
  const trpc = useTRPC()
  const { dbUser } = useAuthenticatedUser()
  const userId = dbUser?.id ?? initialUserId
  const user = dbUser ?? undefined

  const { data: authorization } = useQuery({
    ...trpc.user.getAuthorization.queryOptions(),
    enabled: userId !== undefined,
  })

  const groupMemberships =
    userId !== undefined && groupMembers !== undefined ? (groupMembers.get(userId)?.groupMemberships ?? []) : []
  const activeMembership = findActiveGroupMembershipIn(groupMemberships, interestGroup.slug)
  const isMember = activeMembership !== null
  const isLeader = activeMembership !== null && hasGroupMembershipRoleType(activeMembership, GroupRoleTypeEnum.LEADER)
  const canManage = canAccessInterestGroupAdmin({ isLeader, authorization })
  const canLeave = activeMembership !== null && canEndInterestGroupMembership(activeMembership)
  const toggleMembership = useToggleInterestGroupMembership(groupMemberships)

  return {
    user,
    userId: userId,
    isLoggedIn: userId !== undefined,
    isMember,
    isLeader,
    canManage,
    canLeave,
    memberships: groupMemberships,
    toggleMembership,
  }
}
