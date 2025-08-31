"use client"
import { Skeleton, Stack, Title } from "@mantine/core";
import { useAuditLogAllQuery } from "./queries";
import { GenericTable } from "@/components/GenericTable";
import { useAuditLogTable } from "./use-audit-log-table";

export default function AuditLogDetailsPage() {
  const { auditLogs, isLoading: isAuditLogsLoading } = useAuditLogAllQuery()
  const table = useAuditLogTable( { data: auditLogs });
  
  return <Skeleton visible={isAuditLogsLoading}>
    <Stack>
      <Title>Hendelseslogg</Title>
      <GenericTable table={table} />
    </Stack>
  </Skeleton>
}