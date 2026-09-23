import { useAuthorization } from "@admin/auth/authorization-context"
import { useTRPC } from "@admin/lib/trpc-client"
import type {
  CommitteeApplicationGroupId,
  CommitteeApplicationId,
  CommitteeApplicationPeriodId,
} from "@dotkomonline/rpc/committee-application"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useApplicationPeriodFindManyQuery = () => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.committeeApplication.findManyPeriods.queryOptions({}))

  const applicationPeriods = useMemo(() => data ?? [], [data])

  return { applicationPeriods, ...query }
}

export const useApplicationPeriodGetQuery = (applicationPeriodId: CommitteeApplicationPeriodId) => {
  const trpc = useTRPC()
  return useQuery(trpc.committeeApplication.getPeriodById.queryOptions({ applicationPeriodId }))
}

export const useApplicationPeriodGroupsQuery = (applicationPeriodId: CommitteeApplicationPeriodId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.committeeApplication.findManyGroups.queryOptions({ applicationPeriodId }))
  const { canViewApplicationGroup } = useAuthorization()

  const applicationGroups = useMemo(
    () => (data ?? []).filter((applicationGroup) => canViewApplicationGroup(applicationGroup.groupId)),
    [data, canViewApplicationGroup]
  )

  return { applicationGroups, ...query }
}

export const useApplicationPeriodGroupMatchingsQuery = (applicationPeriodId: CommitteeApplicationPeriodId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(
    trpc.committeeApplication.findManyGroupMatchings.queryOptions({ applicationPeriodId })
  )
  const { canViewApplicationGroup } = useAuthorization()

  const groupMatchings = useMemo(
    () => (data ?? []).filter((groupMatching) => canViewApplicationGroup(groupMatching.groupId)),
    [data, canViewApplicationGroup]
  )

  return { groupMatchings, ...query }
}

export const useApplicantDetailsQuery = (applicationId: CommitteeApplicationId) => {
  const trpc = useTRPC()
  return useQuery(trpc.committeeApplication.getApplicantDetails.queryOptions({ applicationId }))
}

export const useApplicationGroupInterviewBlocksQuery = (applicationGroupId: CommitteeApplicationGroupId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(
    trpc.committeeApplication.findManyInterviewBlocks.queryOptions({ applicationGroupId })
  )

  const interviewBlocks = useMemo(() => data ?? [], [data])

  return { interviewBlocks, ...query }
}
