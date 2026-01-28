import { useTRPC } from "@/lib/trpc-client"
import type { Pageable } from "@dotkomonline/rpc"
import type { AuditLogFilterQuery } from "@dotkomonline/types"
import { useInfiniteQuery } from "@tanstack/react-query"
import { useMemo } from "react"

interface UseAuditLogAllQueryProps {
  filter: AuditLogFilterQuery
  page?: Pageable
}

export const useAuditLogSearchQuery = ({ filter, page }: UseAuditLogAllQueryProps) => {
  const trpc = useTRPC()
  const { data: auditLogs, ...query } = useInfiniteQuery({
    ...trpc.auditLog.findAuditLogs.infiniteQueryOptions({
      filter: {
        ...filter,
      },
      ...page,
    }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })

  return { auditLogs: useMemo(() => auditLogs?.pages.flatMap((page) => page.items) ?? [], [auditLogs]), ...query }
}
