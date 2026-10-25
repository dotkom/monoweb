import { GroupTypeSchema, type GroupId, type GroupType } from "../modules/group/group"
import {
  CommitteeGroupSlug,
  hasAnyGroupAffiliation,
  isAdministrator,
  isCommitteeMember,
  isGroupMember,
  type AffiliatedPrincipal,
} from "./principal"

export type ContestOrganizerGroup = {
  slug: GroupId
  type: GroupType
}

export function toContestOrganizerGroups(
  groupIds: readonly GroupId[],
  groupTypeById: ReadonlyMap<GroupId, GroupType>
): ContestOrganizerGroup[] {
  const organizers: ContestOrganizerGroup[] = []

  for (const slug of groupIds) {
    const type = groupTypeById.get(slug)
    if (type !== undefined) {
      organizers.push({ slug, type })
    }
  }

  return organizers
}

export function canCreateContests(principal: AffiliatedPrincipal): boolean {
  return isCommitteeMember(principal.affiliations)
}

export function canCreateContest(
  principal: AffiliatedPrincipal,
  organizers: readonly ContestOrganizerGroup[]
): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  return hasContestOrganizerAffiliation(principal, organizers)
}

export function canManageContest(
  principal: AffiliatedPrincipal,
  previousOrganizers: readonly ContestOrganizerGroup[],
  nextOrganizers: readonly ContestOrganizerGroup[] = previousOrganizers
): boolean {
  if (isAdministrator(principal.affiliations)) {
    return true
  }

  if (!isCommitteeMember(principal.affiliations)) {
    return false
  }

  return (
    hasContestOrganizerAffiliation(principal, previousOrganizers) &&
    hasContestOrganizerAffiliation(principal, nextOrganizers)
  )
}

function hasContestOrganizerAffiliation(
  principal: AffiliatedPrincipal,
  organizers: readonly ContestOrganizerGroup[]
): boolean {
  if (organizers.some((group) => group.type === GroupTypeSchema.enum.INTEREST_GROUP)) {
    return isGroupMember(principal.affiliations, CommitteeGroupSlug.BACKLOG)
  }

  return hasAnyGroupAffiliation(
    principal.affiliations,
    organizers.map((group) => group.slug)
  )
}
