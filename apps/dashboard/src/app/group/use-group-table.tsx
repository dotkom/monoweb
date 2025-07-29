"use client"

import { type Group, getGroupTypeName } from "@dotkomonline/types"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: Group[]
}

export const useGroupTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<Group>()

  const columns = useMemo(
    () => [
      columnHelper.accessor((group) => group, {
        id: "name",
        header: () => "Navn",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/group/${info.getValue().slug}`}>
            {info.getValue().name}
          </Anchor>
        ),
      }),
      columnHelper.accessor("email", {
        header: () => "Kontakt-e-post",
        cell: (info) => info.getValue(),
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
      columnHelper.accessor("type", {
        header: () => "Type",
        cell: (info) => {
          return getGroupTypeName(info.getValue())
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
