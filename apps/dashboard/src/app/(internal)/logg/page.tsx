"use client"

import type { AuditLogFilterQuery } from "@dotkomonline/rpc/audit-log"
import { Title } from "@dotkomonline/ui"
import { useState } from "react"
import { AuditLogFilters } from "./AuditLogFilters"
import { AuditLogTable } from "./AuditLogTable"
import { useAuditLogSearchQuery } from "./queries"

export default function AuditLogDetailsPage() {
  const [filter, setFilter] = useState<AuditLogFilterQuery>({})
  const { auditLogs, isLoading, isPlaceholderData, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useAuditLogSearchQuery({ filter })

  return (
    <div className="flex flex-col gap-4">
      <Title element="h1" className="text-4xl">
        Hendelseslogg
      </Title>
      <div className="flex flex-col gap-2">
        <AuditLogFilters onChange={setFilter} defaultValues={filter} />

        <AuditLogTable
          auditLogs={auditLogs}
          isLoading={isLoading}
          isPlaceholderData={isPlaceholderData}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      </div>
    </div>
  )
}
