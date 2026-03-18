import { useTRPC } from "@/lib/trpc-client"
import { Pageable } from "@dotkomonline/rpc"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useNotificationAllQuery = (page?: Pageable) => {
  const trpc = useTRPC()

  const { data,  ...query } = useInfiniteQuery({
    ...trpc.notification.findMany.infiniteQueryOptions({ ...page }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (res) => res.pages.flatMap((p) => p.items),
  })

  return { notifications: useMemo(() => data ?? [], [data]), ...query }
}


