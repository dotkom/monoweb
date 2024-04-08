import { Card, Table, TableTbody, TableTd, TableTh, TableThead, TableTr } from "@mantine/core"
import { type Table as ReactTable, flexRender } from "@tanstack/react-table"

export interface GenericTableProps<T> {
  table: ReactTable<T>
}

export function GenericTable<T>({ table }: GenericTableProps<T>) {
  return (
    <Card withBorder>
      <Table>
        <TableThead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableTr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableTh key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableTh>
              ))}
            </TableTr>
          ))}
        </TableThead>
        <TableTbody>
          {table.getRowModel().rows.map((row) => (
            <TableTr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableTd key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableTd>
              ))}
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </Card>
  )
}
