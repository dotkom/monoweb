import { useTRPC } from "@/lib/trpc-client"
import type { Pageable } from "@dotkomonline/utils"
import type { AuditLogFilterQuery } from "@dotkomonline/rpc/audit-log"
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
