import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/lib/trpc-client"

export const useFadderukeFindManyQuery = () => {
  const trpc = useTRPC()

  const { data, ...query } = useQuery(trpc.fadderuke.findMany.queryOptions())

  return { fadderuker: data ?? [], ...query }
}
