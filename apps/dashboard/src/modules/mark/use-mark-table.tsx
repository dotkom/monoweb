"use client"

import type { Mark } from "@dotkomonline/types"
import { formatRelativeTime } from "@dotkomonline/utils"
import { Anchor, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: Mark[]
}

export const useMarkTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<Mark>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: () => "Tittel",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("description", {
        header: () => "Beskrivelse",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("amount", {
        header: () => "Mengde",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("expiresAt", {
        header: () => "Utløper",
        cell: (info) => {
          const value = info.getValue()
          const prefix = value > new Date() ? "Utløper" : "Utløp"
          return (
            <Text>
              {prefix} {formatRelativeTime(info.getValue())}
            </Text>
          )
        },
      }),
      columnHelper.accessor((evt) => evt, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/mark/${info.getValue().id}`}>
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
