"use client"

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Text,
  cn,
} from "@dotkomonline/ui"
import type { UserId } from "@dotkomonline/rpc/user"
import { IconCheckFilled, IconChevronDown } from "@tabler/icons-react"
import { EventItems, type EventListDisplayMode, type EventWithAttendanceDetails } from "./EventList"

interface RegisteredEventsCardProps {
  eventsWithAttendance: EventWithAttendanceDetails[]
  displayMode: EventListDisplayMode
  userId: UserId
  hasMoreEvents: boolean
  open: boolean
  onOpenChange(open: boolean): void
}

export const RegisteredEventsCard = ({
  eventsWithAttendance,
  displayMode,
  userId,
  hasMoreEvents,
  open,
  onOpenChange,
}: RegisteredEventsCardProps) => {
  if (eventsWithAttendance.length === 0) {
    return null
  }

  const previewCount = displayMode === "cards" ? 2 : 1
  const previewEvents = eventsWithAttendance.slice(0, previewCount)
  const remainingEvents = eventsWithAttendance.slice(previewCount)
  const canExpand = remainingEvents.length > 0 || hasMoreEvents
  const peekEvents = remainingEvents.slice(0, displayMode === "cards" ? 2 : 1)

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <Card
        className={cn(
          "py-3 -mx-2 border transition-colors",
          "border-field-border bg-transparent",
          "dark:border-field-border dark:bg-transparent",
          open && "bg-muted dark:bg-muted"
        )}
      >
        <CardHeader>
          <CardTitle className="flex flex-row gap-2 items-center">
            <IconCheckFilled className="size-4" />
            <Text element="span">Dine arrangementer</Text>
          </CardTitle>
          <CardDescription className="ml-6">Kommende arrangementer du er påmeldt</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-2 -mx-2">
          <EventItems eventsWithAttendance={previewEvents} displayMode={displayMode} userId={userId} />

          {!open && peekEvents.length > 0 && (
            <div
              aria-hidden
              inert
              className={cn(
                "pointer-events-none overflow-hidden select-none mask-[linear-gradient(to_bottom,black,transparent)]",
                displayMode === "cards" ? "h-20" : "h-12"
              )}
            >
              <EventItems eventsWithAttendance={peekEvents} displayMode={displayMode} userId={userId} />
            </div>
          )}

          <CollapsibleContent>
            {remainingEvents.length > 0 && (
              <EventItems eventsWithAttendance={remainingEvents} displayMode={displayMode} userId={userId} />
            )}
          </CollapsibleContent>
        </CardContent>

        {canExpand && (
          <CardFooter
            className={cn("relative justify-center bg-transparent border-transparent pt-0", !open && "-mt-14")}
          >
            {/* Makes any transparency of the button opaque, as the button overlaps with content underneath it. */}
            <div className="bg-background rounded-lg">
              <CollapsibleTrigger asChild>
                <Button variant="default" color="gray" aria-expanded={open}>
                  {open ? "Vis færre" : "Se alle"}
                  <IconChevronDown
                    data-icon="inline-end"
                    className={cn("transition-transform", open && "rotate-180")}
                  />
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardFooter>
        )}
      </Card>
    </Collapsible>
  )
}
