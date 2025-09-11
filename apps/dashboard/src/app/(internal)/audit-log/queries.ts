import { useTRPC } from "@/lib/trpc-client"
import { Pageable } from "@dotkomonline/rpc"
import { AuditLogFilterQuery } from "@dotkomonline/types"
import { useQuery } from "@tanstack/react-query"

interface UseAuditLogAllQueryProps {
  filter: AuditLogFilterQuery
  page?: Pageable
}

export const useAuditLogSearchQuery = ({ filter, page }: UseAuditLogAllQueryProps) => {
  const trpc = useTRPC()
  const { data: auditLogs, ...query } = useQuery({
    ...trpc.auditLog.findAuditLogs.queryOptions( { filter: {...filter}, ...page }),
  })
  return { auditLogs, ...query }

}

export const useAuditLogAllQuery = () => {
  const trpc = useTRPC()
  const { data: auditLogs, ...query } = useQuery({
    ...trpc.auditLog.all.queryOptions( {take: 100, }),
  })
  return { auditLogs, ...query }
}
