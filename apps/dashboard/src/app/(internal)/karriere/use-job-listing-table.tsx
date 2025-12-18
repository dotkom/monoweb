"use client"

import { DateTooltip } from "@/components/DateTooltip"
import { type JobListing, getJobListingEmploymentName } from "@dotkomonline/types"
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
          <Anchor component={Link} size="sm" href={`/karriere/${info.getValue().id}`}>
            {info.getValue().title}
          </Anchor>
        ),
      }),
      columnHelper.accessor((company) => company, {
        id: "company",
        header: () => "Bedrift",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/bedrifter/${info.getValue().company.slug}`}>
            {info.getValue().company.name}
          </Anchor>
        ),
      }),
      columnHelper.accessor("start", {
        header: () => "Aktiv fra",
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor("end", {
        header: () => "Aktiv til",
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor("employment", {
        header: () => "Type",
        cell: (info) => {
          return getJobListingEmploymentName(info.getValue())
        },
      }),
      columnHelper.accessor("deadline", {
        header: () => "Frist",
        cell: (info) => {
          const date = info.getValue()

          return date ? <DateTooltip date={date} /> : "Ingen frist"
        },
      }),
      columnHelper.accessor("rollingAdmission", {
        header: () => "Løpende frist",
        cell: (info) => {
          return info.getValue() ? "Ja" : "Nei"
        },
      }),
      columnHelper.accessor("featured", {
        header: () => "Fremhevet",
        cell: (info) => {
          return info.getValue() ? "Ja" : "Nei"
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
