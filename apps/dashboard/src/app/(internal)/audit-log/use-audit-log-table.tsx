import type { AuditLog } from "@dotkomonline/types"
import { Anchor } from "@mantine/core";
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import Link from "next/link";
import { useMemo } from "react"

interface Props {
  data: AuditLog[]
}

export const useAuditLogTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<AuditLog>()
  const columns = useMemo(
    () => [

      columnHelper.accessor("user", {
        header: () => "Bruker",

        cell: (info) => {

        
        return (
        <Anchor component={Link} size="sm" href={`/user/${info.row.original.userId}`}>
          {info.getValue()?.name ?? "System"}
        </Anchor>

        )
        }
      }),

      columnHelper.accessor("createdAt", {
        header: () => "Tidspunkt",
        cell: (info) => formatDate(info.getValue(), "dd.MM.yyyy HH:mm"),
      }),

      columnHelper.accessor("operation", {
        header: () => "Handling",
        cell: (info) => info.getValue()
      }),

      columnHelper.accessor("tableName", {
        header: () => "Type",
        cell: (info) => info.getValue(),
      }),

      columnHelper.accessor("id", {
        header: () => "Detaljer",

        cell: (info) =>

          <Anchor component={Link} size="sm" href={`/audit-log/${info.getValue()}`}> 
            Se detaljer
          </Anchor>

      })
    ],
    [columnHelper]
  )
    return useReactTable({
      data,
      getCoreRowModel: getCoreRowModel(),
      columns,
    })
}

