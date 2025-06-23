import { Icon } from "@iconify/react/dist/iconify.js"
import { Card, Table, TableTbody, TableTd, TableTh, TableThead, TableTr, Text } from "@mantine/core"
import { type Table as ReactTable, flexRender } from "@tanstack/react-table"

export interface GenericTableProps<T> {
  readonly table: ReactTable<T>
  filterable?: boolean
}

export function GenericTable<T>({ table, filterable }: GenericTableProps<T>) {
  return (
    <Card withBorder>
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
                          <Icon icon="tabler:caret-down-filled" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <Icon icon="tabler:caret-up-filled" />
                        ) : (
                          <Icon icon="tabler:caret-up-down-filled" />
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
