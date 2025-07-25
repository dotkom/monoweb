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
      columnHelper.accessor((interestGroup) => interestGroup, {
        id: "name",
        header: () => "Navn",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/interest-group/${info.getValue().id}`}>
            {info.getValue().name}
          </Anchor>
        ),
      }),
      columnHelper.accessor("isActive", {
        header: () => "Aktiv",
        cell: (info) => (info.getValue() ? "Aktiv" : "Inaktiv"),
      }),
      columnHelper.accessor("imageUrl", {
        header: () => "Bilde",
        cell: (info) => {
          const val = info.getValue()
          if (!val) {
            return "Ingen bilde"
          }
          return (
            <Anchor component={Link} size="sm" target="_blank" href={val} rel="noopener">
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
            <Anchor component={Link} size="sm" href={link} target="_blank" rel="noopener noreferrer">
              Wiki
            </Anchor>
          )
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
