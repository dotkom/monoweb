import { useAuthorization } from "@/auth/authorization-context"
import { useGroupAllQuery } from "@/app/(internal)/grupper/queries"
import { useMemo } from "react"

const TARGETABLE_GROUP_TYPES = new Set(["COMMITTEE", "NODE_COMMITTEE", "ASSOCIATED", "INTEREST_GROUP"])

export function useTargetableGroups() {
  const { isAdministrator, affiliations } = useAuthorization()
  const { groups } = useGroupAllQuery()

  return useMemo(() => {
    const memberGroups = groups.filter((group) => TARGETABLE_GROUP_TYPES.has(group.type))

    if (isAdministrator) {
      return memberGroups
    }

    return memberGroups.filter((group) => affiliations.has(group.slug))
  }, [affiliations, groups, isAdministrator])
}
