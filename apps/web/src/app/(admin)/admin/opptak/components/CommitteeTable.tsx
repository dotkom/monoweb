"use client"

import { useAuthorization } from "@admin/auth/authorization-context"
import { FilterableDataTable } from "@admin/components/FilterableDataTable"
import { useGroupAbbreviationMap } from "@admin/grupper/queries"
import { TextLink } from "@dotkomonline/ui"
import { createColumnHelper, getCoreRowModel, type SortingState, type TableOptions } from "@tanstack/react-table"
import { useRouter } from "next/navigation"
import { useMemo } from "react"

interface CommitteeTableProps<T> {
  rows: T[]
  getRowId: (row: T) => string
  getGroupId: (row: T) => string
  getHref: (row: T) => string
  columns: TableOptions<T>["columns"]
  isLoading?: boolean
  actions?: React.ReactNode
  initialSorting?: SortingState
}

export function CommitteeTable<T>({
  rows,
  getRowId,
  getGroupId,
  getHref,
  columns,
  isLoading,
  actions,
  initialSorting,
}: CommitteeTableProps<T>) {
  const router = useRouter()
  const { abbreviationBySlug } = useGroupAbbreviationMap()
  const { isAdministrator } = useAuthorization()

  const columnHelper = createColumnHelper<T>()

  const tableColumns = useMemo(
    () => [
      columnHelper.accessor((row: T) => abbreviationBySlug.get(getGroupId(row)) ?? getGroupId(row), {
        id: "group",
        header: () => "Komité",
        sortingFn: "alphanumeric",
        enableGlobalFilter: true,
        cell: (info) => <TextLink href={getHref(info.row.original)}>{info.getValue()}</TextLink>,
      }),
      ...columns,
    ],
    [abbreviationBySlug, columnHelper, getGroupId, getHref, columns]
  )

  const tableOptions = useMemo(
    () => ({
      data: rows,
      getRowId,
      getCoreRowModel: getCoreRowModel(),
      defaultColumn: { enableGlobalFilter: false },
      columns: tableColumns,
    }),
    [rows, getRowId, tableColumns]
  )

  return (
    <FilterableDataTable
      tableOptions={tableOptions}
      showSearch={isAdministrator}
      searchPlaceholder="Søk etter komité..."
      isLoading={isLoading}
      actions={actions}
      initialSorting={initialSorting}
      onRowClick={(row) => router.push(getHref(row.original))}
    />
  )
}
