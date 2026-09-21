"use client"

import { FilterableDataTable } from "@/components/FilterableDataTable"
import type { Fadderuke } from "@dotkomonline/rpc/fadderuke"
import { TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { useMemo } from "react"

interface Props {
  fadderuker: Fadderuke[]
  canEdit: boolean
  actions?: React.ReactNode
  isLoading?: boolean
}

const columnHelper = createColumnHelper<Fadderuke>()

export const FadderukerTable = ({ fadderuker, canEdit, actions, isLoading }: Props) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor("year", {
        header: () => "År",
        sortingFn: "alphanumeric",
        cell: (info) => {
          const fadderuke = info.row.original
          const label = `Fadderukene ${info.getValue()}`

          if (canEdit) {
            return (
              <TextLink size="sm" href={`/fadderukene/${fadderuke.id}`}>
                {label}
              </TextLink>
            )
          }

          return label
        },
      }),
      columnHelper.accessor("eventId", {
        header: () => "Hovedarrangement",
        enableSorting: false,
        enableGlobalFilter: false,
        cell: (info) => (
          <TextLink size="sm" href={`/arrangementer/${info.getValue()}`}>
            Se arrangement
          </TextLink>
        ),
      }),
    ],
    [canEdit]
  )

  const tableOptions = useMemo(
    () => ({
      data: fadderuker,
      getCoreRowModel: getCoreRowModel(),
      columns,
    }),
    [fadderuker, columns]
  )

  return (
    <FilterableDataTable
      tableOptions={tableOptions}
      actions={actions}
      searchPlaceholder="Søk etter fadderuke..."
      isLoading={isLoading}
    />
  )
}
