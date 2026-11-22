"use client"

import { DateTooltip } from "@admin/components/DateTooltip"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type { SidequestSummaryWithRequest } from "@dotkomonline/rpc/sidequest"
import { mapSidequestStatusToRequestStatusLabel } from "@dotkomonline/rpc/sidequest"
import { DataTable, TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { SidequestRequestStatusBadge } from "./SidequestRequestStatusBadge"

interface Props {
  events: SidequestSummaryWithRequest[]
  isLoading: boolean
  isPlaceholderData: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

const columnHelper = createColumnHelper<SidequestSummaryWithRequest>()

export const SidequestTable = ({
  events,
  isLoading,
  isPlaceholderData,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: Props) => {
  const router = useRouter()

  const columns = [
    columnHelper.accessor((event) => event.title, {
      id: "title",
      header: () => "Sidequest",
      cell: (info) => <TextLink href={`/admin/sidequests/${info.row.original.id}`}>{info.getValue()}</TextLink>,
    }),
    columnHelper.accessor((event) => getGroupDisplayName(event.interestGroup), {
      id: "group",
      header: () => "Interessegruppe",
      cell: (info) => (
        <TextLink href={`/admin/grupper/${info.row.original.interestGroupId}`}>{info.getValue()}</TextLink>
      ),
    }),
    columnHelper.accessor((event) => event.start, {
      id: "start",
      header: () => "Startdato",
      cell: (info) => <DateTooltip date={info.getValue()} />,
    }),
    columnHelper.accessor((event) => mapSidequestStatusToRequestStatusLabel(event.status), {
      id: "status",
      header: () => "Status",
      cell: (info) => <SidequestRequestStatusBadge status={info.row.original.status} />,
    }),
  ]

  const table = useReactTable({
    data: events,
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
      onRowClick={(row) => {
        router.push(`/admin/sidequests/${row.original.id}`)
      }}
    />
  )
}
