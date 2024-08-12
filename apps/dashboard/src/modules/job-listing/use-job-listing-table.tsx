"use client"

import type { JobListing } from "@dotkomonline/types"
import { Anchor, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"
import { formatRelativeTime } from "@dotkomonline/utils"

interface Props {
  data: JobListing[]
}

export const useJobListingTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<JobListing>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("company", {
        header: () => "Bedrift",
        cell: (info) => info.getValue().name,
      }),
      columnHelper.accessor("title", {
        header: () => "Tittel",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("end", {
        header: () => "Aktiv til",
        cell: (info) => {
          return <Text>{formatRelativeTime(info.getValue())}</Text>
        },
      }),
      columnHelper.accessor((evt) => evt, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/job-listing/${info.getValue().id}`}>
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
