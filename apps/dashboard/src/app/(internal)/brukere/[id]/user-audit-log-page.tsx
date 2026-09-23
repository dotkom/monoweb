import { AuditLogFilters } from "@/app/(internal)/logg/AuditLogFilters"
import { AuditLogTable } from "@/app/(internal)/logg/AuditLogTable"
import { useAuditLogSearchQuery } from "@/app/(internal)/logg/queries"
import type { AuditLogFilterQuery } from "@dotkomonline/rpc/audit-log"
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
    <Stack>
      <Title order={2}>Hendelseslogg</Title>
      <AuditLogFilters onChange={setFilter} />
      <Skeleton visible={isAuditLogsLoading}>
        <AuditLogTable
          auditLogs={auditLogs}
          isLoading={isAuditLogsLoading}
          isPlaceholderData={isPlaceholderData}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      </Skeleton>
    </Stack>
  )
}
