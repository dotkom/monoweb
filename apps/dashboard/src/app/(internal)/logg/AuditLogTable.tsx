import { DataTable } from "@/components/DataTable"
import { DateTooltip } from "@/components/DateTooltip"
import type { AuditLog } from "@dotkomonline/rpc/audit-log"
import { Text, TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  auditLogs: AuditLog[]
  isLoading: boolean
  isPlaceholderData: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

export const AuditLogTable = ({
  auditLogs,
  isLoading,
  isPlaceholderData,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: Props) => {
  const columnHelper = createColumnHelper<AuditLog>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("user", {
        header: () => "Bruker",
        sortingFn: "alphanumeric",
        cell: (info) => {
          return info.getValue() ? (
            <TextLink href={`/brukere/${info.row.original.userId}`}>{info.getValue()?.name}</TextLink>
          ) : (
            <Text size="sm">System</Text>
          )
        },
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Tidspunkt",
        sortingFn: "alphanumeric",
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor("operation", {
        header: () => "Handling",
        sortingFn: "alphanumeric",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("tableName", {
        sortingFn: "alphanumeric",
        header: () => "Type",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("id", {
        header: () => "Detaljer",
        cell: (info) => <TextLink href={`/logg/${info.getValue()}`}>Se detaljer</TextLink>,
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: auditLogs,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      isPlaceholderData={isPlaceholderData}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  )
}
