import type { Mark } from "@dotkomonline/types"
import { useTRPC } from "../../../trpc"

import { useQuery } from "@tanstack/react-query"

export const usePunishmentAllQuery = () => {
  const trpc = useTRPC()
  const { data: marks, ...query } = useQuery(trpc.mark.all.queryOptions({ take: 50 }, { initialData: [] as Mark[] }))
  return { marks, ...query }
}
