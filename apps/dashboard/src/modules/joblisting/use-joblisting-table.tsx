"use client"

import { JobListing } from "@dotkomonline/types"
import { Anchor, Text } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"
import { useCompanyAllQuery } from "../company/queries/use-company-all-query"

interface Props {
  data: JobListing[]
}

function formatRemainingTime(targetDate: Date) {
  const now = Date.now()
  const remaining = targetDate.getTime() - now

  const years = Math.floor(remaining / (1000 * 60 * 60 * 24 * 365))
  const months = Math.floor((remaining / (1000 * 60 * 60 * 24 * 30)) % 12)
  const weeks = Math.floor((remaining / (1000 * 60 * 60 * 24 * 7)) % 4)
  const days = Math.floor((remaining / (1000 * 60 * 60 * 24)) % 7)
  const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24)

  if (remaining < 0) {
    return targetDate.toLocaleDateString("nb-NO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  let timeString = targetDate.toLocaleDateString("nb-NO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Determine which two metrics to display
  if (years > 0) {
    timeString += ` (${years} år, ${months} måneder)`
  } else if (months > 0) {
    timeString += ` (${months} måneder, ${weeks} uker)`
  } else if (weeks > 0) {
    timeString += ` (${weeks} uker, ${days} dager)`
  } else {
    timeString += ` (${days} dager, ${hours} timer)`
  }

  return timeString
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
      // title
      columnHelper.accessor("title", {
        header: () => "Tittel",
        cell: (info) => info.getValue(),
      }),
      // active to
      // example: 19. oktober 2023 23:54 (23 timer, 50 minutter)
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
          <Anchor component={Link} size="sm" href={`/joblisting/${info.getValue().id}`}>
            Se mer
          </Anchor>
        ),
      }),
    ],
    [columnHelper, companies]
  )

  return useReactTable({
    data: data,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })
}
