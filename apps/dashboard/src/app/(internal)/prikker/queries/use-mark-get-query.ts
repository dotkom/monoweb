import { useTRPC } from "@/lib/trpc-client"
import type { MarkId } from "@dotkomonline/rpc/mark"
import { useQuery } from "@tanstack/react-query"

export const useMarkGetQuery = (id: MarkId) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.mark.get.queryOptions(id))

  const mark = data ?? null

  return { mark, ...query }
}
