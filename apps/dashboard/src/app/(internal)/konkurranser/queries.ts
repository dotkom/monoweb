import { useTRPC } from "@/lib/trpc-client"
import type { ContestId } from "@dotkomonline/rpc/contest"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useContestFindManyQuery = () => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.contest.findMany.queryOptions({}))

  const contests = useMemo(() => data ?? [], [data])

  return { contests, ...query }
}

export const useContestWithContestantsQuery = (contestId: ContestId) => {
  const trpc = useTRPC()
  return useQuery(trpc.contest.getWithContestants.queryOptions({ contestId }))
}
