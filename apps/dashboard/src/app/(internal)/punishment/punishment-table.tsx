"use client"

import { GenericTable } from "@/components/GenericTable"
import type { Mark } from "@dotkomonline/types"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import Link from "next/link"

interface Props {
  marks: Mark[]
  onLoadMore?: () => void
}

export const PunishmentTable = ({ marks, onLoadMore }: Props) => {
  const columnHelper = createColumnHelper<Mark>()
  const columns = [
    columnHelper.accessor((mark) => mark, {
      id: "title",
      header: () => "Navn",
      cell: (info) => (
        <Anchor component={Link} size="sm" href={`/punishment/${info.getValue().id}`}>
          {info.getValue().title}
        </Anchor>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: () => "Opprettet",
      cell: (info) => formatDate(info.getValue(), "dd.MM.yyyy"),
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
          .map((group) => group.slug)
          .join(" "),
    }),
  ]

  const table = useReactTable({
    data: marks,
    getCoreRowModel: getCoreRowModel(),
    columns,
  })

  return <GenericTable table={table} onLoadMore={onLoadMore} />
}
