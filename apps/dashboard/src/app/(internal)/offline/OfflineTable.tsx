"use client"

import { DateTooltip } from "@/components/DateTooltip"
import { FilterableDataTable } from "@/components/FilterableDataTable"
import type { Offline } from "@dotkomonline/rpc/offline"
import { TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  offlines: Offline[]
  canEdit: boolean
  actions?: React.ReactNode
  isLoading?: boolean
}

const columnHelper = createColumnHelper<Offline>()

export const OfflineTable = ({ offlines, canEdit, actions, isLoading }: Props) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor((offline) => offline.title, {
        id: "title",
        header: () => "Tittel",
        sortingFn: "alphanumeric",
        cell: (info) => {
          const offline = info.row.original
          if (canEdit) {
            return (
              <TextLink size="sm" href={`/offline/${offline.id}`}>
                {offline.title}
              </TextLink>
            )
          }

          return offline.title
        },
      }),
      columnHelper.accessor("publishedAt", {
        header: () => "Utgivelsesdato",
        sortingFn: "datetime",
        cell: (info) => <DateTooltip date={info.getValue()} />,
      }),
      columnHelper.accessor("fileUrl", {
        header: () => "Fil",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: (info) => {
          const val = info.getValue()
          if (val === null) {
            return "Ingen fil"
          }
          return (
            <TextLink target="_blank" size="sm" href={val} rel="noopener">
              Link
            </TextLink>
          )
        },
      }),
      columnHelper.accessor("imageUrl", {
        header: () => "Bilde",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: (info) => {
          const val = info.getValue()
          if (!val) {
            return "Ingen bilde"
          }

          return (
            <TextLink target="_blank" size="sm" href={val} rel="noopener">
              Link
            </TextLink>
          )
        },
      }),
    ],
    [canEdit]
  )

  const tableOptions = useMemo(
    () => ({
      data: offlines,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [offlines, columns]
  )

  return (
    <FilterableDataTable
      tableOptions={tableOptions}
      actions={actions}
      searchPlaceholder="Søk etter offline..."
      isLoading={isLoading}
    />
  )
}
