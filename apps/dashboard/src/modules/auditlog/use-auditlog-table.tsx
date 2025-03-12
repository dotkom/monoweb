"use client"

import { Auditlog } from "@dotkomonline/types"
import { formatRelativeTime } from "@dotkomonline/utils"
import { Anchor, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: Auditlog[]
}

export const useAuditlogTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<Auditlog>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("modelName", {
        header: () => "Område",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("action", {
        header: () => "Action",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Tid",
        cell: (info) => (
          <Text size="sm">
            {formatRelativeTime(info.getValue())}
          </Text>
        ),
      }),
      columnHelper.accessor("userId", {
        header: () => "userId",
        cell: (info) => info.getValue(),

      }),
      columnHelper.accessor("firstName", {
        header: () => "firstName",
        cell: (info) => info.getValue(),

      }),
      columnHelper.accessor("lastName", {
        header: () => "lastName",
        cell: (info) => info.getValue(),

      }),
      columnHelper.accessor((evt) => evt, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/auditlog/${info.getValue().id}`}>
            Se mer
          </Anchor>
        ),
      }),
    ],
    [columnHelper]
  )

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
