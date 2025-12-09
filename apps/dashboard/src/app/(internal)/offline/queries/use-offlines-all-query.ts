import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc-client"

export const useOfflineAllQuery = () => {
  const trpc = useTRPC()
  const { data: offlines, ...query } = useQuery({
    ...trpc.offline.all.queryOptions({ take: 999 }),
    initialData: [],
  })
  return { offlines, ...query }
}
