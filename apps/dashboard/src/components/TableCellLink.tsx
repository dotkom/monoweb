import { Anchor, type AnchorProps } from "@mantine/core"
import Link from "next/link"
import type { ComponentPropsWithoutRef } from "react"
import "./TableCellLink.css"

export type TableCellLinkProps = Omit<AnchorProps, "component"> & ComponentPropsWithoutRef<typeof Link>

function basicMergeClassNames(...classNames: (string | undefined)[]) {
  return classNames.filter((className) => Boolean(className)).join(" ")
}

export function TableCellLink({ className, underline = "never", size = "sm", ...props }: TableCellLinkProps) {
  return (
    <Anchor
      component={Link}
      underline={underline}
      size={size}
      className={basicMergeClassNames("table-cell-link", className)}
      {...props}
    />
  )
}
