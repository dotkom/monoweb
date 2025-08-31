import { useTRPC } from "@/lib/trpc-client"
import { useQuery } from "@tanstack/react-query"


export const useAuditLogAllQuery = () => {
  const trpc = useTRPC()
  const { data: auditLogs, ...query } = useQuery({
    ...trpc.auditLog.all.queryOptions({ take: 999 }),
    initialData: [],
  })
  return { auditLogs, ...query }
}
