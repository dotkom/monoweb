"use client"

import type { InterestGroup } from "@dotkomonline/types"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: InterestGroup[]
}

export const useInterestGroupTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<InterestGroup>()
  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: () => "Navn",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("description", {
        header: () => "Kort beskrivelse",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("image", {
        header: () => "Bilde",
        cell: (info) => {
          const val = info.getValue()
          if (!val) {
            return "Ingen bilde"
          }
          return (
            <Anchor target="_blank" href={val} rel="noopener">
              Link
            </Anchor>
          )
        },
      }),
      columnHelper.accessor("link", {
        header: () => "Wiki Link",
        cell: (info) => {
          const link = info.getValue()
          if (!link) return

          return (
            <Anchor href={link} target="_blank" rel="noopener noreferrer">
              Wiki
            </Anchor>
          )
        },
      }),
      columnHelper.accessor((evt) => evt, {
        id: "actions",
        header: () => "Detaljer",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/interest-group/${info.getValue().id}`}>
            Se mer
          </Anchor>
        ),
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
