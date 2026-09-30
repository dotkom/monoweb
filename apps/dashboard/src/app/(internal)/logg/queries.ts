import { useTRPC } from "@/lib/trpc-client"
import type { AuditLogFilterQuery } from "@dotkomonline/rpc/audit-log"
import type { Pageable } from "@dotkomonline/utils"
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

export const useAuditLogGetByIdQuery = (id: string) => {
  const trpc = useTRPC()
  return useQuery(trpc.auditLog.getById.queryOptions(id))
}

interface UseAuditLogAllQueryProps {
  filter: AuditLogFilterQuery
  page?: Pageable
}

export const useAuditLogSearchQuery = ({ filter, page }: UseAuditLogAllQueryProps) => {
  const trpc = useTRPC()
  const { data: auditLogs, ...query } = useInfiniteQuery({
    ...trpc.auditLog.findAuditLogs.infiniteQueryOptions({
      filter,
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    placeholderData: keepPreviousData,
  })

  return { auditLogs: useMemo(() => auditLogs?.pages.flatMap((page) => page.items) ?? [], [auditLogs]), ...query }
}

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
