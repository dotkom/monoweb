import { useTRPC } from "@/lib/trpc-client"

import { useQuery } from "@tanstack/react-query"

export const usePunishmentAllQuery = () => {
  const trpc = useTRPC()
  const { data: marks, ...query } = useQuery({ ...trpc.mark.all.queryOptions({ take: 50 }), initialData: [] }) //TODO: Switch to infinite query
  return { marks, ...query }
}
