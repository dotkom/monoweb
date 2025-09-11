"use client"
import { GenericTable } from "@/components/GenericTable"

import { Skeleton, Stack, Title } from "@mantine/core"
import { useAuditLogSearchQuery } from "./queries"
import { useState } from "react"
import { AuditLogFilterQuery } from "@dotkomonline/types"
import { AuditLogFilters } from "./components/audit-log-filters"
import { AllAuditLogsTable } from "./use-audit-log-table"

export default function AuditLogDetailsPage() {

  const [filter, setFilter] = useState<AuditLogFilterQuery>({})
  const { auditLogs, isLoading: isAuditLogsLoading } = useAuditLogSearchQuery({ filter }) 

  return (
    <Skeleton visible={isAuditLogsLoading}>
      <Stack>
        <Title>Hendelseslogg</Title>
        <AuditLogFilters onChange={setFilter} />
        <AllAuditLogsTable audit_logs={auditLogs?.items || []} ></AllAuditLogsTable>
      </Stack>
    </Skeleton>
  )
}

