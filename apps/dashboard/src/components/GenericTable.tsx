import { Card, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from "@mantine/core"
import { IconCaretDownFilled, IconCaretUpDownFilled, IconCaretUpFilled } from "@tabler/icons-react"
import { type Table as ReactTable, flexRender } from "@tanstack/react-table"

export interface GenericTableProps<T> {
  readonly table: ReactTable<T>
  filterable?: boolean
}

export function GenericTable<T>({ table, filterable }: GenericTableProps<T>) {
  return (
    <Card withBorder mah="75dvh">
      <Table.ScrollContainer minWidth={600} type="native">
        <Table>
          <TableThead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableTr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableTh
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    style={{
                      cursor: filterable && header.column.getCanSort() ? "pointer" : undefined,
                      userSelect: filterable && header.column.getCanSort() ? "none" : undefined,
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {filterable &&
                        header.column.getCanSort() &&
                        (header.column.getIsSorted() === "asc" ? (
                          <IconCaretDownFilled width={12} height={12} />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <IconCaretUpFilled width={12} height={12} />
                        ) : (
                          <IconCaretUpDownFilled width={12} height={12} />
                        ))}
                    </span>
                  </TableTh>
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
      </Table.ScrollContainer>
    </Card>
  )
}
