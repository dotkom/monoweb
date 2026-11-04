"use client"

import { AuditLogFilters } from "@admin/logg/AuditLogFilters"
import { AuditLogTable } from "@admin/logg/AuditLogTable"
import { useAuditActivityInfiniteQuery } from "@admin/logg/queries"
import type { AuditLogFilterQuery } from "@dotkomonline/rpc/audit-log"
import { Title } from "@dotkomonline/ui"
import { useState } from "react"
import { useUserDetailsContext } from "../provider"

export default function UserAuditLogPage() {
  const { user } = useUserDetailsContext()

  const [filter, setFilter] = useState<AuditLogFilterQuery>()
  const {
    auditActivities,
    isLoading: isAuditLogsLoading,
    fetchNextPage,
    isPlaceholderData,
    isFetchingNextPage,
    hasNextPage,
  } = useAuditActivityInfiniteQuery({
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
      <div className="flex flex-col gap-2">
        <AuditLogFilters onChange={setFilter} />
        <AuditLogTable
          auditActivities={auditActivities}
          isLoading={isAuditLogsLoading}
          isPlaceholderData={isPlaceholderData}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
        />
      </div>
    </div>
  )
}
