import { useTRPC } from "@/lib/trpc-client"
import type { AuditLogFilterQuery } from "@dotkomonline/rpc/audit-log"
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

interface UseAuditActivityInfiniteQueryProps {
  filter: AuditLogFilterQuery
  cursor?: number
  limit?: number
}

export const useAuditActivityInfiniteQuery = ({ filter, cursor, limit }: UseAuditActivityInfiniteQueryProps) => {
  const trpc = useTRPC()

  const { data, ...query } = useInfiniteQuery({
    ...trpc.auditLog.findAuditActivities.infiniteQueryOptions({ filter, cursor, limit }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
    select: (data) => data.pages.flatMap((page) => page.items),
  })

  const auditActivities = useMemo(() => data ?? [], [data])

  return { auditActivities, ...query }
}
