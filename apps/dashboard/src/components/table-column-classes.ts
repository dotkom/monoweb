import { cn } from "@dotkomonline/ui"

export type TableColumnMeta = {
  fit?: boolean
  smallPadding?: boolean
  noPadding?: boolean
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> extends TableColumnMeta {}
}

export function getTableColumnClassName(meta?: TableColumnMeta, forCell = false): string {
  if (meta === undefined) {
    return ""
  }

  return cn(meta.fit && "w-[1%] whitespace-nowrap", meta.smallPadding && "px-2.5", meta.noPadding && forCell && "p-0")
}
