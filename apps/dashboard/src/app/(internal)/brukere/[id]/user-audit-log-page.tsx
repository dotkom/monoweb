import { AuditLogFilters } from "@/app/(internal)/logg/components/audit-log-filters"
import { useAuditLogSearchQuery } from "@/app/(internal)/logg/queries"
import { AuditLogsTable } from "@/app/(internal)/logg/use-audit-log-table"
import type { AuditLogFilterQuery } from "@dotkomonline/types"
import { Skeleton, Stack, Title } from "@mantine/core"
import type { FC } from "react"
import { useState } from "react"
import { useUserDetailsContext } from "./provider"

export const UserAuditLogPage: FC = () => {
  const { user } = useUserDetailsContext()

  const [filter, setFilter] = useState<AuditLogFilterQuery>()
  const {
    auditLogs,
    isLoading: isAuditLogsLoading,
    isFetchingNextPage,
    fetchNextPage,
  } = useAuditLogSearchQuery({
    filter: {
      ...filter,
      byUserId: [user.id],
    },
  })

  return (
    <Stack>
      <Title order={2}>Hendelseslogg</Title>
      <AuditLogFilters onChange={setFilter} />
      <Skeleton visible={isAuditLogsLoading}>
        <AuditLogsTable
          audit_logs={auditLogs}
          onLoadMore={fetchNextPage}
          isLoading={isAuditLogsLoading}
          isLoadingMore={isFetchingNextPage}
        />
      </Skeleton>
    </Stack>
  )
}
