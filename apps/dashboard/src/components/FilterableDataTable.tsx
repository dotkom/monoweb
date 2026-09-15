"use client"

import { DataTable } from "@/components/DataTable"
import { TagInput, TextInput } from "@dotkomonline/ui"
import {
  type ColumnFiltersState,
  type FilterFn,
  type SortingFn,
  type SortingState,
  type TableOptions,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"

type FilterOption = {
  label: string
  value: string | boolean
  columnId: string
}

type FilterableDataTableProps<T> = {
  tableOptions: TableOptions<T>
  filters?: FilterOption[]
  searchPlaceholder?: string
  filterPlaceholder?: string
}

export function FilterableDataTable<T>({
  tableOptions,
  filters,
  searchPlaceholder = "Søk...",
  filterPlaceholder = "Velg filter...",
}: FilterableDataTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])

  const table = useReactTable({
    ...tableOptions,
    state: {
      ...tableOptions.state,
      globalFilter,
      sorting,
      columnFilters,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: "includesString",
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const applyColumnFilters = (selected: string[]) => {
    setSelectedLabels(selected)

    if (!filters) {
      setColumnFilters([])
      return
    }

    const filtersByColumn: Record<string, (string | boolean)[]> = {}
    for (const label of selected) {
      const opt = filters.find((f) => f.label === label)
      if (!opt) {
        continue
      }

      if (!filtersByColumn[opt.columnId]) {
        filtersByColumn[opt.columnId] = []
      }

      filtersByColumn[opt.columnId].push(opt.value)
    }

    setColumnFilters(Object.entries(filtersByColumn).map(([id, value]) => ({ id, value })))
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2 flex-wrap">
        <TextInput
          className="h-8 text-sm! placeholder:text-sm"
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.currentTarget.value)}
        />
        {filters && (
          <TagInput
            placeholder={filterPlaceholder}
            data={filters.map((opt) => opt.label)}
            value={selectedLabels}
            onChange={applyColumnFilters}
            className="w-fit"
            creatable={false}
          />
        )}
      </div>
      <DataTable table={table} filterable={true} />
    </div>
  )
}

export function arrayOrEqualsFilter<T>(): FilterFn<T> {
  return (row, columnId, filterValue) => {
    const value = row.getValue(columnId)
    return Array.isArray(filterValue) ? filterValue.includes(value) : value === filterValue
  }
}

export function dateSort<T>(): SortingFn<T> {
  return (rowA, rowB, columnId) => {
    const a = Date.parse(rowA.getValue(columnId) ?? "")
    const b = Date.parse(rowB.getValue(columnId) ?? "")

    if (Number.isNaN(a) && Number.isNaN(b)) {
      return 0
    }

    if (Number.isNaN(a)) {
      return 1
    }

    if (Number.isNaN(b)) {
      return -1
    }

    return a - b
  }
}
