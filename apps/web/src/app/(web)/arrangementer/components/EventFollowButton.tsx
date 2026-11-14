"use client"

import { Button, cn, Popover, PopoverContent, PopoverTrigger, Text } from "@dotkomonline/ui"
import { ButtonGroup } from "@dotkomonline/ui/components/button-group"
import { Switch } from "@dotkomonline/ui/components/switch"
import { IconBell, IconBellFilled, IconChevronDown } from "@tabler/icons-react"
import { useId, useState } from "react"

// Interaction preview only; preferences are not persisted or connected to subscriptions.
export function EventFollowButton() {
  const notificationsId = useId()
  const calendarId = useId()

  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false)
  const [isCalendarEnabled, setIsCalendarEnabled] = useState(false)
  const isFollowing = isNotificationsEnabled || isCalendarEnabled

  const handleFollow = () => {
    const shouldFollow = isFollowing === false

    setIsNotificationsEnabled(shouldFollow)
    setIsCalendarEnabled(shouldFollow)
  }

  return (
    <Popover>
      <ButtonGroup
        aria-label="Følg arrangementet"
        className="[&>[data-slot]:first-child]:rounded-l-full! [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-full!"
      >
        <Button
          variant="secondary"
          size="default"
          onClick={handleFollow}
          aria-pressed={isFollowing}
          className={cn(
            "h-8 gap-1.5 pl-1.75 pr-2 text-base",
            !isFollowing && "bg-transparent",
            isFollowing && "dark:bg-stone-800"
          )}
        >
          {isFollowing ? (
            <IconBellFilled aria-hidden className="size-5" />
          ) : (
            <IconBell aria-hidden className="size-5" />
          )}
          {isFollowing ? "Følger" : "Følg"}
        </Button>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Innstillinger for å følge arrangementet"
            className={cn(
              "h-8 w-7 pr-0.75 border-l border-field-border",
              !isFollowing && "bg-transparent",
              isFollowing && "dark:bg-stone-800"
            )}
          >
            <IconChevronDown aria-hidden className="size-4" />
          </Button>
        </PopoverTrigger>
      </ButtonGroup>
      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] gap-4 p-4">
        <Text
          element="label"
          htmlFor={notificationsId}
          className="flex cursor-pointer items-center justify-between gap-4"
        >
          <span className="flex flex-col gap-1">
            <span className="text-sm font-medium">Varsler</span>
            <span className="text-xs text-muted-foreground">Få beskjed om endringer og oppdateringer.</span>
          </span>
          <Switch id={notificationsId} checked={isNotificationsEnabled} onCheckedChange={setIsNotificationsEnabled} />
        </Text>

        <Text element="label" htmlFor={calendarId} className="flex cursor-pointer items-center justify-between gap-4">
          <span className="flex flex-col gap-1">
            <span className="text-sm font-medium">Personlig kalender</span>
            <span className="text-xs text-muted-foreground">Vis i kalenderen du abonnerer på.</span>
          </span>
          <Switch id={calendarId} checked={isCalendarEnabled} onCheckedChange={setIsCalendarEnabled} />
        </Text>
      </PopoverContent>
    </Popover>
  )
}
