import { flexRender, type Table as ReactTable } from "@tanstack/react-table"
import { Card, Table, TableThead, TableTr, TableTh, TableTd, TableTbody, Text } from "@mantine/core"

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
          {table.getRowModel().rows.length === 0 && (
            <TableTr>
              <TableTd colSpan={table.getAllColumns().length} align="center">
                <Text>Ingen data</Text>
              </TableTd>
            </TableTr>
          )}
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
