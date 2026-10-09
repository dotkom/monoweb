"use client"

import { Button, type ButtonProps, Popover, PopoverContent, PopoverTrigger } from "@dotkomonline/ui"
import { IconCalendarPlus } from "@tabler/icons-react"
import { useState } from "react"
import { CalendarSubscriptionPanel } from "./CalendarSubscriptionPanel"

interface CalendarSubscriptionButtonProps {
  triggerVariant?: ButtonProps["variant"]
  className?: string
}

export function CalendarSubscriptionButton({ triggerVariant = "ghost", className }: CalendarSubscriptionButtonProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={triggerVariant}
          aria-label="Abonner på arrangementer"
          title="Få arrangementene i kalenderen"
          className={className}
        >
          <IconCalendarPlus className="size-4" />
          Abonner
        </Button>
      </PopoverTrigger>

      <PopoverContent
        aria-label="Arrangementer i kalenderen"
        align="end"
        positionMethod="fixed"
        className="w-96 max-w-[calc(100vw-2rem)] max-h-[min(80dvh,var(--available-height))] overflow-y-auto rounded-xl p-4"
      >
        <CalendarSubscriptionPanel enabled={popoverOpen} />
      </PopoverContent>
    </Popover>
  )
}
