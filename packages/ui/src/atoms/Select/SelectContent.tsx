"use client"

import { SelectContent as ShadcnSelectContent } from "#components/select"
import type { ComponentProps } from "react"

type SelectContentProps = ComponentProps<typeof ShadcnSelectContent> & {
  position?: "item-aligned" | "popper"
  hideScrollUpButton?: boolean
}

export function SelectContent({
  position = "popper",
  hideScrollUpButton: _hideScrollUpButton,
  align = "start",
  alignItemWithTrigger,
  ...props
}: SelectContentProps) {
  const resolvedAlignItemWithTrigger = alignItemWithTrigger ?? position !== "popper"

  return <ShadcnSelectContent align={align} alignItemWithTrigger={resolvedAlignItemWithTrigger} {...props} />
}
