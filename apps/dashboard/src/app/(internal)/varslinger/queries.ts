import { useTRPC } from "@/lib/trpc-client"
import type { Pageable } from "@dotkomonline/utils"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useNotificationRecipientsQuery = (notificationId: string) => {
  const trpc = useTRPC()
  const { data, ...query } = useQuery(trpc.notification.getRecipients.queryOptions(notificationId))
  return { recipients: data ?? [], ...query }
}

export const useNotificationAllInfiniteQuery = (page?: Pageable) => {
  const trpc = useTRPC()

  const { data, ...query } = useInfiniteQuery({
    ...trpc.notification.findMany.infiniteQueryOptions({ ...page }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (res) => res.pages.flatMap((p) => p.items),
  })

  return { notifications: useMemo(() => data ?? [], [data]), ...query }
}
