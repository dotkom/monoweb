"use client"

import { AuditLogFilters } from "@/app/(internal)/logg/AuditLogFilters"
import { AuditLogTable } from "@/app/(internal)/logg/AuditLogTable"
import { useAuditLogSearchQuery } from "@/app/(internal)/logg/queries"
import type { AuditLogFilterQuery } from "@dotkomonline/rpc/audit-log"
import { Title } from "@dotkomonline/ui"
import { useState } from "react"
import { useUserDetailsContext } from "../provider"

export default function UserHendelsesloggPage() {
  const { user } = useUserDetailsContext()

  const [filter, setFilter] = useState<AuditLogFilterQuery>()
  const {
    auditLogs,
    isLoading: isAuditLogsLoading,
    fetchNextPage,
    isPlaceholderData,
    isFetchingNextPage,
    hasNextPage,
  } = useAuditLogSearchQuery({
    filter: {
      ...filter,
      byUserId: [user.id],
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <Title element="h2" className="text-2xl font-semibold">
        Hendelseslogg
      </Title>
      <AuditLogFilters onChange={setFilter} />
      <AuditLogTable
        auditLogs={auditLogs}
        isLoading={isAuditLogsLoading}
        isPlaceholderData={isPlaceholderData}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage ?? false}
        fetchNextPage={fetchNextPage}
      />
    </div>
  )
}
