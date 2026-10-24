"use client"

import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, cn } from "@dotkomonline/ui"
import { IconBook2, IconCalendarPlus, IconDots } from "@tabler/icons-react"
import { useState } from "react"
import { EventRules, EventRulesDialog } from "./AttendanceCard/EventRules"
import { CalendarSubscriptionDialog } from "./CalendarSubscriptionDialog"

export const EventListOptionsMenu = ({ className }: { className?: string }) => {
  const [subscriptionOpen, setSubscriptionOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="icon-xl"
              aria-label="Flere valg"
              title="Flere valg"
              className={cn("shrink-0 rounded-lg", className)}
            />
          }
        >
          <IconDots className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setSubscriptionOpen(true)}>
            <IconCalendarPlus className="size-4" />
            Abonner
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRulesOpen(true)}>
            <IconBook2 className="size-4" />
            Prikkeregler
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CalendarSubscriptionDialog open={subscriptionOpen} onOpenChange={setSubscriptionOpen} />
      <EventRulesDialog open={rulesOpen} onOpenChange={setRulesOpen} />
    </>
  )
}

/** Same options as the menu, as inline buttons */
export const EventListOptionButtons = ({ className }: { className?: string }) => {
  const [subscriptionOpen, setSubscriptionOpen] = useState(false)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button variant="ghost" className="text-muted-foreground px-1.5" onClick={() => setSubscriptionOpen(true)}>
        <IconCalendarPlus className="size-4" />
        Abonner
      </Button>
      <EventRules className="text-muted-foreground px-1.5" />

      <CalendarSubscriptionDialog open={subscriptionOpen} onOpenChange={setSubscriptionOpen} />
    </div>
  )
}
