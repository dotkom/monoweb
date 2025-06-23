"use client"

import type { JobListing } from "@dotkomonline/types"
import { formatRelativeTime } from "@dotkomonline/utils"
import { Anchor } from "@mantine/core"
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
        id: "title",
        header: () => "Tittel",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/job-listing/${info.getValue().id}`}>
            {info.getValue().title}
          </Anchor>
        ),
      }),
      columnHelper.accessor((company) => company, {
        id: "company",
        header: () => "Bedrift",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/company/${info.getValue().company.id}`}>
            {info.getValue().company.name}
          </Anchor>
        ),
      }),
      columnHelper.accessor("end", {
        header: () => "Aktiv til",
        cell: (info) => {
          return formatRelativeTime(info.getValue())
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
