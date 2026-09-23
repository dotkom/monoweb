"use client"

import { DataTable } from "@/components/DataTable"
import { DateTooltip } from "@/components/DateTooltip"
import { type JobListing, getJobListingEmploymentName } from "@dotkomonline/rpc/job-listing"
import { TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  data: JobListing[]
  isLoading: boolean
  isPlaceholderData: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

export const JobListingTable = ({
  data,
  isLoading,
  isPlaceholderData,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: Props) => {
  const columnHelper = createColumnHelper<JobListing>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((company) => company, {
        id: "title",
        header: () => "Tittel",
        cell: (info) => <TextLink href={`/karriere/${info.getValue().id}`}>{info.getValue().title}</TextLink>,
      }),
      columnHelper.accessor((company) => company, {
        id: "company",
        header: () => "Bedrift",
        cell: (info) => (
          <TextLink href={`/bedrifter/${info.getValue().company.slug}`}>{info.getValue().company.name}</TextLink>
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

  const table = useReactTable({
    data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      isPlaceholderData={isPlaceholderData}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  )
}
