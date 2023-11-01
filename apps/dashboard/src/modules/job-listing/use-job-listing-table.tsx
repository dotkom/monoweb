"use client"

import { type JobListing } from "@dotkomonline/types"
import { Anchor, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"
import { useCompanyAllQuery } from "../company/queries/use-company-all-query"
import { formatRemainingTime } from "../../utils/format"

interface Props {
  data: JobListing[]
}

export const useJobListingTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<JobListing>()
  const { companies } = useCompanyAllQuery()
  const columns = useMemo(
    () => [
      columnHelper.accessor("companyId", {
        header: () => "Bedrift",
        cell: (info) => companies.find((company) => company.id === info.row.original.companyId)?.name ?? "Ukjent",
      }),
      columnHelper.accessor("title", {
        header: () => "Tittel",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("end", {
        header: () => "Aktiv til",
        cell: (info) => {
          const timeString = formatRemainingTime(info.getValue())
          return <Text>{timeString}</Text>
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
    [columnHelper, companies]
  )

  return useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
