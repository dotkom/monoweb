"use client"

import type { AuditLogFilterQuery } from "@dotkomonline/types"
import { Skeleton, Stack, Title } from "@mantine/core"
import { useState } from "react"
import { AuditLogFilters } from "./components/audit-log-filters"
import { useAuditLogSearchQuery } from "./queries"
import { AuditLogsTable } from "./use-audit-log-table"

export default function AuditLogDetailsPage() {
  const [filter, setFilter] = useState<AuditLogFilterQuery>({})
  const { auditLogs, isLoading: isAuditLogsLoading, fetchNextPage } = useAuditLogSearchQuery({ filter })

  return (
    <Skeleton visible={isAuditLogsLoading}>
      <Stack>
        <Title>Hendelseslogg</Title>
        <AuditLogFilters onChange={setFilter} />
        <AuditLogsTable audit_logs={auditLogs} onLoadMore={fetchNextPage} />
      </Stack>
    </Skeleton>
  )
}
