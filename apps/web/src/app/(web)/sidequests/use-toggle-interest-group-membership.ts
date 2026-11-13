import {
  canEndInterestGroupMemberships,
  getActiveMembershipsForGroup,
  type Group,
  type GroupMembership,
} from "@dotkomonline/rpc/group"
import { useEndInterestGroupMembershipMutation, useStartInterestGroupMembershipMutation } from "./mutations"

export const useToggleInterestGroupMembership = (groupmemberships: GroupMembership[]) => {
  const startInterestGroupMembershipMutation = useStartInterestGroupMembershipMutation()
  const endInterestGroupMembershipMutation = useEndInterestGroupMembershipMutation()

  const toggleInterestGroupMembership = (interestGroup: Group) => {
    const isMember = getActiveMembershipsForGroup(groupmemberships, interestGroup.slug).length > 0
    if (!isMember) {
      startInterestGroupMembershipMutation.mutate(interestGroup.slug)
      return
    }

    const canEndMembership = canEndInterestGroupMemberships(groupmemberships, interestGroup)
    if (!canEndMembership) {
      return
    }

    endInterestGroupMembershipMutation.mutate(interestGroup.slug)
  }

  return toggleInterestGroupMembership
}
