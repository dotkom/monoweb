import { useTRPC } from "@/lib/trpc-client"
import { useQuery } from "@tanstack/react-query"

export const useOfflineAllQuery = () => {
  const trpc = useTRPC()
  const { data: offlines, ...query } = useQuery({
    ...trpc.offline.all.queryOptions({ take: 999 }),
    initialData: [],
  })
  return { offlines, ...query }
}
