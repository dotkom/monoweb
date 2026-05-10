import type { ContestId } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc-client"

export const useContestFindManyQuery = () => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.contest.findMany.queryOptions({}))
  return { contests: data ?? [], ...query }
}

export const useContestGetByIdQuery = (id: ContestId) => {
  const trpc = useTRPC()
  return useQuery(trpc.contest.getById.queryOptions(id))
}

export const useContestWithContestantsQuery = (id: ContestId) => {
  const trpc = useTRPC()
  return useQuery(trpc.contest.getWithContestants.queryOptions(id))
}
