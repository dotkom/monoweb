"use client"

import { Collapsible, CollapsibleContent, CollapsibleTrigger, Label, cn } from "@dotkomonline/ui"
import { IconChevronDown } from "@tabler/icons-react"
import type { ReactNode } from "react"
import { CountBadge } from "./CountBadge"

interface CollapsibleFilterSectionProps {
  title: string
  count: number
  children: ReactNode
  className?: string
}

export const CollapsibleFilterSection = ({ title, count, children, className }: CollapsibleFilterSectionProps) => {
  return (
    <Collapsible className={className} defaultOpen={true}>
      <CollapsibleTrigger
        className={cn(
          "cursor-pointer w-full flex items-center justify-between gap-2 font-medium text-gray-500",
          "hover:text-gray-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors"
        )}
      >
        <div className="flex items-center gap-2 h-5.5 mb-2">
          <Label className="cursor-pointer text-foreground">{title}</Label>
          <CountBadge count={count} />
        </div>
        <IconChevronDown className="size-[1.25em] transition-transform" />
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  )
}
