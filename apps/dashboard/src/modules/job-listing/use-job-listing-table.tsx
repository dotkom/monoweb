"use client"

import type { JobListing } from "@dotkomonline/types"
import { formatRelativeTime } from "@dotkomonline/utils"
import { Anchor, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: JobListing[]
}

export const useJobListingTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<JobListing>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((company) => company, {
        id: "company",
        header: () => "Bedrift",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/job-listing/${info.getValue().id}`}>
            {info.getValue().company.name}
          </Anchor>
        ),
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
    ],
    [columnHelper]
  )

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
