import { useTRPC } from "@/lib/trpc-client"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useFadderukeGetByIdQuery = (id: string) => {
  const trpc = useTRPC()
  return useQuery(trpc.fadderuke.getById.queryOptions(id))
}

export const useFadderukeFindManyQuery = () => {
  const trpc = useTRPC()

  const { data, ...query } = useQuery(trpc.fadderuke.findMany.queryOptions())

  const fadderuker = useMemo(() => data ?? [], [data])

  return { fadderuker, ...query }
}
