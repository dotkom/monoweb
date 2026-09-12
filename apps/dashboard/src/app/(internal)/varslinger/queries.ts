import { useTRPC } from "@/lib/trpc-client"
import type { NotificationFilterQuery } from "@dotkomonline/rpc/notification"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export function useNotificationsInfiniteQuery(filters: NotificationFilterQuery = {}) {
  const trpc = useTRPC()
  const { data, ...query } = useInfiniteQuery({
    ...trpc.notification.findMany.infiniteQueryOptions({
      filters,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  return {
    notifications: useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]),
    ...query,
  }
}
