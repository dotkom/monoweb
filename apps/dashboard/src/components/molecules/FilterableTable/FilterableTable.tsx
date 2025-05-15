import { Card, Group, MultiSelect, TextInput } from "@mantine/core"
import {
  type FilterFn,
  type SortingState,
  type TableOptions,
  getFilteredRowModel,
  getSortedRowModel,
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
    <Card>
      <Group mb="md">
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
