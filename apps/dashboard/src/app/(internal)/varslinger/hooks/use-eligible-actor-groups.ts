import { useAuthorization } from "@/auth/authorization-context"
import { COMMITTEE_AFFILIATIONS, intersectGroupAffiliations, isCommitteeAffiliation } from "@/auth/permissions"
import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import type { NotificationLaunchContext } from "../notification-launch-context"
import { useMemo } from "react"

export function useEligibleActorGroups(launchContext: NotificationLaunchContext) {
  const { isAdministrator, isCommitteeMember, affiliations } = useAuthorization()
  const { groups } = useGroupAllQuery()

  const eligibleSlugs = useMemo(() => {
    const authorizationState = { isAdministrator, isCommitteeMember, affiliations }

    if (launchContext.kind === "EVENT") {
      return [...intersectGroupAffiliations(authorizationState, launchContext.hostingGroupSlugs)]
    }

    if (launchContext.kind === "GROUP") {
      return [launchContext.groupSlug]
    }

    if (isAdministrator) {
      return [...COMMITTEE_AFFILIATIONS]
    }

    return [...affiliations.keys()].filter(isCommitteeAffiliation)
  }, [affiliations, isAdministrator, isCommitteeMember, launchContext])

  return useMemo(() => groups.filter((group) => eligibleSlugs.includes(group.slug)), [eligibleSlugs, groups])
}
