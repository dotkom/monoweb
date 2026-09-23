import { useTRPC } from "@/lib/trpc-client"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useOfflineByIdQuery = (id: string) => {
  const trpc = useTRPC()
  return useQuery(trpc.offline.get.queryOptions(id))
}

export const useOfflineAllQuery = () => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery({
    ...trpc.offline.all.queryOptions({ take: 1000 }),
  })

  const offlines = useMemo(() => data ?? [], [data])

  return { offlines, ...query }
}
