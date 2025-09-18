"use client"

import type { AuditLogFilterQuery } from "@dotkomonline/types"
import { Skeleton, Stack, Title } from "@mantine/core"
import { useState } from "react"
import { AuditLogFilters } from "./components/audit-log-filters"
import { useAuditLogSearchQuery } from "./queries"
import { AllAuditLogsTable } from "./use-audit-log-table"

export default function AuditLogDetailsPage() {
  const [filter, setFilter] = useState<AuditLogFilterQuery>({})
  const { auditLogs, isLoading: isAuditLogsLoading } = useAuditLogSearchQuery({ filter })

  return (
    <Skeleton visible={isAuditLogsLoading}>
      <Stack>
        <Title>Hendelseslogg</Title>
        <AuditLogFilters onChange={setFilter} />
        <AllAuditLogsTable audit_logs={auditLogs?.items || []} />
      </Stack>
    </Skeleton>
  )
}
