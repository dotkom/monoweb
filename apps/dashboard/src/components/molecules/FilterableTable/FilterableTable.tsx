import { Card, Group, MultiSelect, TextInput } from "@mantine/core"
import {
  type FilterFn,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingFn,
  type SortingState,
  type TableOptions,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"
import { GenericTable } from "src/components/GenericTable"

type FilterOption = {
  label: string
  value: string | boolean
  columnId: string
}

type FilterableTableProps<T> = {
  tableOptions: TableOptions<T>
  filters: FilterOption[]
}

export function FilterableTable<T>({ tableOptions, filters }: FilterableTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    ...tableOptions,
    state: {
      globalFilter,
      sorting,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    globalFilterFn: "includesString",
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <Card p={0} bg="inherit">
      <Group mb="xs" gap="xs">
        <TextInput placeholder="Søk..." value={globalFilter} onChange={(e) => setGlobalFilter(e.currentTarget.value)} />
        <MultiSelect
          placeholder="Velg filter"
          data={filters.map((opt, idx) => ({
            label: opt.label,
            value: `${idx}`,
          }))}
          onChange={(selected) => {
            table.resetColumnFilters()

            const filtersByColumn = selected.reduce<Record<string, (string | boolean)[]>>((acc, item) => {
              const filter = filters[Number(item)]
              if (!filter) return acc

              acc[filter.columnId] ??= []
              acc[filter.columnId].push(filter.value)

              return acc
            }, {})

            for (const [columnId, values] of Object.entries(filtersByColumn)) {
              table.getColumn(columnId)?.setFilterValue(values)
            }
          }}
        />
      </Group>
      <GenericTable table={table} filterable={true} />
    </Card>
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
