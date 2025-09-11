import { GenericTable } from "@/components/GenericTable"
import type { AuditLog } from "@dotkomonline/types"
import { Anchor, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  audit_logs: AuditLog[]
}

export const AllAuditLogsTable = ({ audit_logs }: Props) => {
  const columnHelper = createColumnHelper<AuditLog>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("user", {
        header: () => "Bruker",
        sortingFn: "alphanumeric",
        cell: (info) => {
          return info.getValue() ? (
            <Anchor component={Link} size="sm" href={`/user/${info.row.original.userId}`}>
              {info.getValue()?.name}
            </Anchor>
          ) : (
            <Text size="sm">System</Text>
          )
        },
      }),

      columnHelper.accessor("createdAt", {
        header: () => "Tidspunkt",
        sortingFn: "alphanumeric",
        cell: (info) => formatDate(info.getValue(), "dd.MM.yyyy HH:mm"),
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

        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/audit-log/${info.getValue()}`}>
            Se detaljer
          </Anchor>
        ),
      }),
    ],
    [columnHelper]
  )
  const tableOptions = useMemo(
    () => ({
      data: audit_logs,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }), [audit_logs, columns]
  )

  return (
        <GenericTable table={useReactTable(tableOptions)} />
  )
}
