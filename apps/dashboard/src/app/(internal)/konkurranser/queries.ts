import type { ContestId } from "@dotkomonline/rpc/contest"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc-client"

export const useContestFindManyQuery = () => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.contest.findMany.queryOptions({}))
  return { contests: data ?? [], ...query }
}

export const useContestGetByIdQuery = (contestId: ContestId) => {
  const trpc = useTRPC()
  return useQuery(trpc.contest.getById.queryOptions({ contestId }))
}

export const useContestWithContestantsQuery = (contestId: ContestId) => {
  const trpc = useTRPC()
  return useQuery(trpc.contest.getWithContestants.queryOptions({ contestId }))
}
