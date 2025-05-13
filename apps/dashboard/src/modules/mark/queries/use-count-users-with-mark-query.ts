import type { MarkId } from "@dotkomonline/types"
import { useTRPC } from "../../../trpc"

import { useQuery } from "@tanstack/react-query"

export const useMarkCountUsersQuery = (id: MarkId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.personalMark.countUsersWithMark.queryOptions({ id }))
  return { data, ...query }
}
