"use client"

import { cn, Text, Tooltip, TooltipContent, TooltipTrigger } from "@dotkomonline/ui"
import { IconLock } from "@tabler/icons-react"

interface Props {
  reason: string
  className?: string
  iconClassName?: string
}

export const InterestGroupEventDeadlineLock = ({ reason, className, iconClassName }: Props) => {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "relative z-10 inline-flex items-center justify-center rounded-sm bg-muted px-0.75 py-0.5 text-gray-700 dark:text-stone-200",
            className
          )}
        >
          <IconLock className={cn("size-3.5", iconClassName)} />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="w-fit max-w-64 p-2">
        <Text size="sm">{reason}</Text>
      </TooltipContent>
    </Tooltip>
  )
}
