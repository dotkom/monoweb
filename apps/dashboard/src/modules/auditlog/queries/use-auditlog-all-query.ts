import { trpc } from "../../../trpc"

export const useAuditlogAllQuery = () => {
  const { data: auditlogs = [], ...query } = trpc.auditlog.all.useQuery({ take: 999 })
  return { auditlogs, ...query }
}