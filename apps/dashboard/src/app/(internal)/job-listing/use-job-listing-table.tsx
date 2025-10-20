"use client"

import { type JobListing, getJobListingEmploymentName } from "@dotkomonline/types"
import { Anchor, Text, Tooltip } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link"
import { useMemo } from "react"

const capitalizeFirstLetter = (string: string) => `${string.charAt(0).toUpperCase()}${string.slice(1)}`

const getDateTooltip = (date: Date) => {
  const longDate = formatDate(date, "eeee dd. MMMM yyyy HH:mm", {
    locale: nb,
  })
  const shortDate = formatDate(date, "dd. MMM yyyy", { locale: nb })

  return (
    <Tooltip label={capitalizeFirstLetter(longDate)}>
      <Text size="sm" w="fit-content">
        {shortDate}
      </Text>
    </Tooltip>
  )
}

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
          <Anchor component={Link} size="sm" href={`/company/${info.getValue().company.slug}`}>
            {info.getValue().company.name}
          </Anchor>
        ),
      }),
      columnHelper.accessor("start", {
        header: () => "Aktiv fra",
        cell: (info) => {
          return getDateTooltip(info.getValue())
        },
      }),
      columnHelper.accessor("end", {
        header: () => "Aktiv til",
        cell: (info) => {
          return getDateTooltip(info.getValue())
        },
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

          return date ? getDateTooltip(date) : "Ingen frist"
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
