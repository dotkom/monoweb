"use client"

import { SelectItem, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import type { ReactNode } from "react"
import type { PeriodSelection } from "../../course-page-params"
import { isSamePeriodSelection } from "../../utils"

const selectItemClassName =
  "cursor-pointer p-2 text-neutral-950 hover:bg-gray-100 data-highlighted:bg-gray-100 dark:text-stone-200 dark:hover:bg-stone-700 dark:data-highlighted:bg-stone-700 data-disabled:text-neutral-400 dark:data-disabled:text-stone-500"

type Props = {
  value: string
  selection: PeriodSelection
  periodSelection: PeriodSelection
  disabledReason: string
  children: ReactNode
}

export function ComparisonSelectItem({ value, selection, periodSelection, disabledReason, children }: Props) {
  const disabled = isSamePeriodSelection(periodSelection, selection)

  const item = (
    <SelectItem value={value} disabled={disabled} className={selectItemClassName}>
      {children}
    </SelectItem>
  )

  if (!disabled) {
    return item
  }

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div className="w-full">{item}</div>
      </TooltipTrigger>
      <TooltipContent className="dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200">
        <Text className="text-sm">{disabledReason}</Text>
      </TooltipContent>
    </Tooltip>
  )
}
