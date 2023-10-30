"use client"

import { Offline } from "@dotkomonline/types"
import { Anchor, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"
import { useCompanyAllQuery } from "../company/queries/use-company-all-query"
import { formatDate } from "../../utils/format"

interface Props {
  data: Offline[]
}

export const useOfflineTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<Offline>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("title", {
        header: () => "Tittel",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("published", {
        header: () => "Utgivelsesdato",
        cell: (info) => {
          return <Text>{formatDate(info.getValue())}</Text>
        },
      }),
      columnHelper.accessor((evt) => evt, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/offline/${info.getValue().id}`}>
            Se mer
          </Anchor>
        ),
      }),
    ],
    [columnHelper]
  )

  return useReactTable({
    data: data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
