"use client"

import type { AuditLogFilterQuery } from "@dotkomonline/types"
import { Card, Skeleton, Stack, Title } from "@mantine/core"
import { useState } from "react"
import { AuditLogFilters } from "./components/audit-log-filters"
import { useAuditLogSearchQuery } from "./queries"
import { AuditLogsTable } from "./use-audit-log-table"

export default function AuditLogDetailsPage() {
  const [filter, setFilter] = useState<AuditLogFilterQuery>({})
  const { auditLogs, isLoading: isAuditLogsLoading, fetchNextPage } = useAuditLogSearchQuery({ filter })

  return (
    <Stack>
      <Title>Hendelseslogg</Title>
      <Card p={0} bg="inherit">
        <AuditLogFilters onChange={setFilter} />
        <Skeleton visible={isAuditLogsLoading}>
          <AuditLogsTable audit_logs={auditLogs} onLoadMore={fetchNextPage} />
        </Skeleton>
      </Card>
    </Stack>
  )
}
