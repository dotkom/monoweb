"use client"

import type { Offline } from "@dotkomonline/types"
import { Anchor } from "@mantine/core"
import { createColumnHelper, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { formatDate } from "date-fns"
import Link from "next/link"
import { useMemo } from "react"

interface Props {
  data: Offline[]
}

export const useOfflineTable = ({ data }: Props) => {
  const columnHelper = createColumnHelper<Offline>()
  const columns = useMemo(
    () => [
      columnHelper.accessor((offline) => offline, {
        id: "title",
        header: () => "Tittel",
        cell: (info) => (
          <Anchor component={Link} size="sm" href={`/offline/${info.getValue().id}`}>
            {info.getValue().title}
          </Anchor>
        ),
      }),
      columnHelper.accessor("publishedAt", {
        header: () => "Utgivelsesdato",
        cell: (info) => formatDate(info.getValue(), "dd.MM.yyyy"),
      }),
      columnHelper.accessor("fileUrl", {
        header: () => "Fil",
        cell: (info) => {
          const val = info.getValue()
          if (val === null) {
            return "Ingen fil"
          }
          return (
            <Anchor target="_blank" size="sm" href={val} rel="noopener">
              Link
            </Anchor>
          )
        },
      }),
      columnHelper.accessor("imageUrl", {
        header: () => "Bilde",
        cell: (info) => {
          const val = info.getValue()
          if (!val) {
            return "Ingen bilde"
          }

          return (
            <Anchor target="_blank" size="sm" href={val} rel="noopener">
              Link
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
