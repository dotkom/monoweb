"use client"

import { getTableColumnClassName } from "./table-column-classes"
import { ScrollArea } from "@base-ui/react/scroll-area"
import { cn } from "../../utils"
import { Text } from "../../atoms/Typography/Text"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../Table/Table"
import { IconArrowNarrowDown, IconArrowNarrowUp, IconArrowsSort } from "@tabler/icons-react"
import { flexRender, type Table as ReactTable, type Row } from "@tanstack/react-table"
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react"

const INTERACTIVE_ROW_CLICK_SELECTOR = "a, button, input, label, textarea, select"

export interface DataTableProps<TableData> {
  readonly table: ReactTable<TableData>
  filterable?: boolean
  getRowClassName?: (row: Row<TableData>) => string | undefined
  getRowStyle?: (row: Row<TableData>) => CSSProperties | undefined
  getCellStyle?: (row: Row<TableData>, columnIndex: number) => CSSProperties | undefined
  onRowClick?: (row: Row<TableData>, event: MouseEvent<HTMLTableRowElement>) => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  fetchNextPage?: () => void
  isLoading?: boolean
  isPlaceholderData?: boolean
}

export function DataTable<TableData>({
  table,
  filterable,
  getRowClassName,
  getRowStyle,
  getCellStyle,
  onRowClick,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  isLoading,
  isPlaceholderData = false,
}: DataTableProps<TableData>) {
  const loaderRef = useRef<HTMLDivElement>(null)
  const scrollParentRef = useRef<HTMLDivElement>(null)
  const tableHeaderRef = useRef<HTMLTableSectionElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)
  const isInitialLoading = Boolean(isLoading && table.getRowModel().rows.length === 0)

  useEffect(() => {
    const tableHeader = tableHeaderRef.current

    if (isInitialLoading || tableHeader === null) {
      return
    }

    const updateHeaderHeight = () => setHeaderHeight(tableHeader.getBoundingClientRect().height)
    updateHeaderHeight()

    const observer = new ResizeObserver(updateHeaderHeight)
    observer.observe(tableHeader)

    return () => observer.disconnect()
  }, [isInitialLoading])

  useEffect(() => {
    if (isInitialLoading) {
      return
    }

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
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isPlaceholderData, isInitialLoading])

  if (isInitialLoading) {
    return <div className="rounded-sm animate-pulse bg-gray-300 dark:bg-stone-700 h-105 w-full" />
  }

  return (
    <ScrollArea.Root className="relative overflow-hidden rounded-lg bg-card border border-field-border">
      <ScrollArea.Viewport ref={scrollParentRef} className="max-h-100 overscroll-contain rounded-[inherit]">
        <ScrollArea.Content>
          <Table containerClassName="overflow-visible">
            <TableHeader ref={tableHeaderRef} className="sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={cn(
                        "h-6.5 text-xs font-medium text-muted-foreground bg-muted",
                        getTableColumnClassName(header.column.columnDef.meta),
                        filterable && header.column.getCanSort() && "cursor-pointer select-none"
                      )}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {filterable &&
                          header.column.getCanSort() &&
                          (header.column.getIsSorted() === "asc" ? (
                            <IconArrowNarrowUp className="size-2.75 stroke-[2.5]" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <IconArrowNarrowDown className="size-2.75 stroke-[2.5]" />
                          ) : (
                            <IconArrowsSort className="size-2.75 stroke-[2.5]" />
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
                <TableRow
                  key={row.id}
                  style={{ ...getRowStyle?.(row) }}
                  className={cn(
                    "transition-colors duration-200",
                    onRowClick ? "cursor-pointer" : "hover:bg-transparent",
                    getRowClassName?.(row)
                  )}
                  onClick={onRowClick ? (event) => handleRowClick(row, event, onRowClick) : undefined}
                >
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
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar className="z-20 w-2 p-0.5" style={{ top: headerHeight }}>
        <ScrollArea.Thumb className="w-full rounded-full bg-muted-foreground/40 hover:bg-muted-foreground/60" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar orientation="horizontal" className="z-20 h-2 p-0.5">
        <ScrollArea.Thumb className="h-full rounded-full bg-muted-foreground/40 hover:bg-muted-foreground/60" />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  )
}

function handleRowClick<TableData>(
  row: Row<TableData>,
  event: MouseEvent<HTMLTableRowElement>,
  onRowClick: (row: Row<TableData>, event: MouseEvent<HTMLTableRowElement>) => void
) {
  if (event.target instanceof Element && event.target.closest(INTERACTIVE_ROW_CLICK_SELECTOR)) {
    return
  }

  onRowClick(row, event)
}
