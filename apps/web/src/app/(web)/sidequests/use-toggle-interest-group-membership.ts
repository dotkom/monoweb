import {
  canEndInterestGroupMembership,
  findActiveGroupMembershipIn,
  type Group,
  type GroupMembership,
} from "@dotkomonline/rpc/group"
import { useEndInterestGroupMembershipMutation, useStartInterestGroupMembershipMutation } from "./mutations"

export const useToggleInterestGroupMembership = (groupmemberships: GroupMembership[]) => {
  const startInterestGroupMembershipMutation = useStartInterestGroupMembershipMutation()
  const endInterestGroupMembershipMutation = useEndInterestGroupMembershipMutation()

  const toggleInterestGroupMembership = (interestGroup: Group) => {
    const activeMembership = findActiveGroupMembershipIn(groupmemberships, interestGroup.slug)
    if (activeMembership === null) {
      startInterestGroupMembershipMutation.mutate(interestGroup.slug)
      return
    }

    if (!canEndInterestGroupMembership(activeMembership)) {
      return
    }

    endInterestGroupMembershipMutation.mutate(interestGroup.slug)
  }

  return toggleInterestGroupMembership
}
