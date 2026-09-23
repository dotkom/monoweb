"use client"

import { DataTable } from "@/components/DataTable"
import { DateTooltip } from "@/components/DateTooltip"
import { getGroupDisplayName } from "@dotkomonline/rpc/group"
import type { Mark } from "@dotkomonline/rpc/mark"
import { TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  marks: Mark[]
  isLoading: boolean
  isPlaceholderData: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
}

export const MarkTable = ({
  marks,
  isLoading,
  isPlaceholderData,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
}: Props) => {
  const columnHelper = createColumnHelper<Mark>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((mark) => mark, {
        id: "title",
        header: () => "Navn",
        cell: (info) => <TextLink href={`/prikker/${info.getValue().id}`}>{info.getValue().title}</TextLink>,
      }),
      columnHelper.accessor("createdAt", {
        header: () => "Opprettet",
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor("weight", {
        header: () => "Vekt",
        cell: (info) => {
          const value = info.getValue()

          return <>{value === 6 ? "Suspensjon" : value.toString()}</>
        },
      }),
      columnHelper.accessor("duration", {
        header: () => "Varighet",
        cell: (info) => `${info.getValue()} dager`,
      }),
      columnHelper.accessor("groups", {
        header: () => "Grupper",
        cell: (info) =>
          info
            .getValue()
            .map((group) => getGroupDisplayName(group))
            .join(" "),
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data: marks,
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
