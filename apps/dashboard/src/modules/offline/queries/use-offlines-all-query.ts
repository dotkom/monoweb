import type { Offline } from "@dotkomonline/types"
import { useTRPC } from "../../../trpc"

import { useQuery } from "@tanstack/react-query"

export const useOfflineAllQuery = () => {
  const trpc = useTRPC()
  const { data: offlines, ...query } = useQuery(
    trpc.offline.all.queryOptions({ take: 999 }, { initialData: [] as Offline[] })
  )
  return { offlines, ...query }
}
