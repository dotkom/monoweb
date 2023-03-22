import { flexRender, type Table as ReactTable } from "@tanstack/react-table"
import { Card, Table } from "@mantine/core"

export type GenericTableProps<T> = {
  table: ReactTable<T>
}

export function GenericTable<T>({ table }: GenericTableProps<T>) {
  return (
    <Card withBorder shadow="sm">
      <Table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  )
}
