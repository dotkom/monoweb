import type { CSSProperties } from "react"

export type TableColumnMeta = {
  width?: CSSProperties["width"]
  minWidth?: CSSProperties["minWidth"]
  maxWidth?: CSSProperties["maxWidth"]
  padding?: CSSProperties["padding"]
  smallPadding?: boolean
  noPadding?: boolean
  fit?: boolean
}

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> extends TableColumnMeta {}
}

export function getTableColumnStyle(meta?: TableColumnMeta, forCell = false): CSSProperties {
  if (meta === undefined) {
    return {}
  }

  const style: CSSProperties = {}

  // This makes the column fit the content width
  if (meta.fit) {
    style.width = "1%"
    style.whiteSpace = "nowrap"
  }

  if (meta.width !== undefined) {
    style.width = meta.width
  }

  if (meta.minWidth !== undefined) {
    style.minWidth = meta.minWidth
  }

  if (meta.maxWidth !== undefined) {
    style.maxWidth = meta.maxWidth
  }

  if (meta.padding === undefined) {
    if (meta.smallPadding) {
      style.paddingInline = "var(--mantine-spacing-xs)"
    }

    if (meta.noPadding && forCell) {
      style.padding = 0
    }
  } else {
    style.paddingInline = undefined
    style.padding = meta.padding
  }

  return style
}
