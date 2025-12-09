import type { MarkId } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc-client"

export const useMarkCountUsersQuery = (markId: MarkId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.personalMark.countUsersWithMark.queryOptions({ markId }))
  return { data, ...query }
}
