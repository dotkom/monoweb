import { getTableColumnClassName } from "@/components/table-column-classes"
import { cn, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Text } from "@dotkomonline/ui"
import { IconCaretDownFilled, IconCaretUpDownFilled, IconCaretUpFilled } from "@tabler/icons-react"
import { flexRender, type Table as ReactTable, type Row } from "@tanstack/react-table"
import { useEffect, useRef, type CSSProperties } from "react"

export interface DataTableProps<T> {
  readonly table: ReactTable<T>
  filterable?: boolean
  getRowStyle?: (row: Row<T>) => CSSProperties | undefined
  getCellStyle?: (row: Row<T>, columnIndex: number) => CSSProperties | undefined
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
  isLoading?: boolean
  isPlaceholderData?: boolean
}

export function DataTable<T>({
  table,
  filterable,
  getRowStyle,
  getCellStyle,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  isPlaceholderData = false,
}: DataTableProps<T>) {
  const loaderRef = useRef<HTMLDivElement>(null)
  const scrollParentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !isLoading && !isPlaceholderData) {
          fetchNextPage?.()
        }
      },
      {
        root: scrollParentRef.current,
        // Fetch next page slightly before the last row is visible
        rootMargin: "200px 0px",
        threshold: 0,
      }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isPlaceholderData])

  if (isLoading && table.getRowModel().rows.length === 0) {
    return <div className="rounded-sm animate-pulse bg-gray-300 dark:bg-stone-700 h-105 w-full" />
  }

  return (
    <div className="relative overflow-hidden rounded-sm p-2.5 ring-1 ring-foreground/10 bg-card">
      <div ref={scrollParentRef} className="max-h-100 overflow-auto">
        <Table containerClassName="overflow-visible">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={cn(
                      "sticky top-0 z-10 bg-card",
                      getTableColumnClassName(header.column.columnDef.meta),
                      filterable && header.column.getCanSort() && "cursor-pointer select-none"
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
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
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 && (
              <TableRow className="even:bg-muted/40">
                <TableCell colSpan={table.getAllColumns().length} align="center">
                  <Text>Ingen data</Text>
                </TableCell>
              </TableRow>
            )}

            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} style={{ ...getRowStyle?.(row) }} className="hover:bg-transparent">
                {row.getVisibleCells().map((cell, columnIndex) => (
                  <TableCell
                    key={cell.id}
                    className={getTableColumnClassName(cell.column.columnDef.meta, true)}
                    style={{
                      ...getCellStyle?.(row, columnIndex),
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div ref={loaderRef} className="h-px" />
      </div>
    </div>
  )
}
