"use client"

import { env } from "@/env"
import { useCopyToClipboard } from "@/utils/use-copy-to-clipboard"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  type ButtonProps,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import {
  IconCalendarEvent,
  IconCalendarPlus,
  IconCheck,
  IconChevronDown,
  IconCopy,
  IconLoader2,
  IconUser,
} from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import {
  createAllEventsCalendarUrl,
  createGoogleCalendarSubscribeUrl,
  createOutlookCalendarSubscribeUrl,
  createPersonalCalendarSubscriptionUrl,
  createWebcalUrl,
  fetchPersonalCalendarToken,
} from "./calendar-subscription"
import { AppleCalendarLogo } from "./AppleCalendarLogo"
import Image from "next/image"

type CalendarFeed = "personal" | "all"

interface CalendarSubscriptionButtonProps {
  triggerVariant?: ButtonProps["variant"]
}

export function CalendarSubscriptionButton({ triggerVariant = "outline" }: CalendarSubscriptionButtonProps) {
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { dbUser } = useAuthenticatedUser()
  const [selectedFeed, setSelectedFeed] = useState<CalendarFeed>("personal")

  const isLoggedIn = Boolean(dbUser)
  const isPersonalFeed = selectedFeed === "personal"
  const shouldFetchPersonalToken = isLoggedIn && isPersonalFeed && popoverOpen

  const personalCalendarTokenQuery = useQuery({
    queryKey: ["calendar", "me"],
    queryFn: fetchPersonalCalendarToken,
    enabled: shouldFetchPersonalToken,
  })

  const allEventsCalendarUrl = createAllEventsCalendarUrl(env.NEXT_PUBLIC_ORIGIN)
  const personalCalendarUrl = personalCalendarTokenQuery.data
    ? createPersonalCalendarSubscriptionUrl(env.NEXT_PUBLIC_ORIGIN, personalCalendarTokenQuery.data)
    : ""

  let selectedCalendarUrl = allEventsCalendarUrl

  if (isPersonalFeed) {
    selectedCalendarUrl = personalCalendarUrl
  }

  let selectedFeedDescription = "Offentlige arrangementer fra Online."

  if (isPersonalFeed && isLoggedIn) {
    selectedFeedDescription = "Arrangementer du er påmeldt. Lenken er personlig, så ikke del den."
  }

  if (isPersonalFeed && !isLoggedIn) {
    selectedFeedDescription = "Logg inn for å abonnere på arrangementene du er påmeldt."
  }

  let mainLabel = "Abonner på alle arrangementer"
  let shortLabel = "Alle arrangementer"

  if (isPersonalFeed) {
    mainLabel = "Abonner på dine arrangementer"
    shortLabel = "Dine arrangementer"
  }

  let personalSelectedIcon = null

  if (isPersonalFeed) {
    personalSelectedIcon = <IconCheck className="ml-auto size-4" />
  }

  let allEventsSelectedIcon = null

  if (!isPersonalFeed) {
    allEventsSelectedIcon = <IconCheck className="ml-auto size-4" />
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverAnchor className="inline-flex">
        <PopoverTrigger asChild>
          <Button
            variant={triggerVariant}
            className="h-10 rounded-r-none shrink-0"
            icon={<IconCalendarPlus className="size-4" />}
          >
            <Text element="span" className="max-sm:hidden">
              {mainLabel}
            </Text>

            <Text element="span" className="sm:hidden">
              {shortLabel}
            </Text>
          </Button>
        </PopoverTrigger>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant={triggerVariant}
              aria-label="Bytt kalender"
              className="h-10 w-8 rounded-l-none border-l-0 px-0 shrink-0"
            >
              <IconChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedFeed("personal")
                setPopoverOpen(true)
              }}
            >
              <UserProfileAvatar imageUrl={dbUser?.imageUrl} name={dbUser?.name} />
              Dine arrangementer
              {personalSelectedIcon}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => {
                setSelectedFeed("all")
                setPopoverOpen(true)
              }}
            >
              <IconCalendarEvent className="ml-2 size-4 text-muted-foreground" />
              Alle arrangementer
              {allEventsSelectedIcon}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PopoverAnchor>
      <PopoverContent align="end" className="w-60">
        <div className="flex flex-col gap-2">
          <Text className="text-sm text-muted-foreground">{selectedFeedDescription}</Text>

          {isPersonalFeed && !isLoggedIn && (
            <Button
              element="a"
              href={createAuthorizeUrl({ returnTo: "/arrangementer" })}
              variant="default"
              className="w-fit"
            >
              Logg inn
            </Button>
          )}

          {isPersonalFeed && isLoggedIn && personalCalendarTokenQuery.isLoading && (
            <div className="flex flex-row items-center gap-2 text-muted-foreground">
              <IconLoader2 className="size-4 animate-spin" />
              <Text className="text-sm">Henter kalenderlenke…</Text>
            </div>
          )}

          {isPersonalFeed && isLoggedIn && personalCalendarTokenQuery.isError && (
            <Text className="text-sm text-red-600 dark:text-red-400">
              Kunne ikke hente kalenderlenken. Prøv igjen senere.
            </Text>
          )}

          {selectedCalendarUrl && !(isPersonalFeed && personalCalendarTokenQuery.isLoading) && (
            <CalendarFeedActions calendarName={shortLabel} calendarUrl={selectedCalendarUrl} />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function UserProfileAvatar({ imageUrl, name }: { imageUrl?: string | null; name?: string | null }) {
  return (
    <Avatar className="size-6 shrink-0">
      <AvatarImage src={imageUrl ?? undefined} alt={name ?? "Profilbilde"} />
      <AvatarFallback className="bg-gray-300 dark:bg-stone-700">
        <IconUser className="size-3.75" />
      </AvatarFallback>
    </Avatar>
  )
}

function CalendarFeedActions({ calendarName, calendarUrl }: { calendarName: string; calendarUrl: string }) {
  const { icon: copiedIcon, copy } = useCopyToClipboard()
  const hasCopied = copiedIcon === "check"
  const CopyIcon = hasCopied ? IconCheck : IconCopy
  const copyIconClassName = hasCopied ? "size-4 text-green-600 dark:text-green-400" : "size-4 text-muted-foreground"

  const googleCalendarUrl = createGoogleCalendarSubscribeUrl(calendarUrl)
  const outlookCalendarUrl = createOutlookCalendarSubscribeUrl(calendarUrl, calendarName)
  const appleCalendarUrl = createWebcalUrl(calendarUrl)

  return (
    <div className="flex flex-col gap-2">
      <Button element="a" href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">
        <Image src="/logo-google-calendar.svg" alt="Google Calendar" width={16} height={16} />
        Google Kalender
      </Button>

      <Button element="a" href={outlookCalendarUrl} target="_blank" rel="noopener noreferrer">
        <Image src="/logo-microsoft-outlook.svg" alt="Microsoft Outlook" width={16} height={16} />
        Outlook
      </Button>

      <Button element="a" href={appleCalendarUrl}>
        <AppleCalendarLogo />
        Apple Kalender
      </Button>

      <Button
        variant="outline"
        icon={<CopyIcon aria-hidden className={copyIconClassName} />}
        onClick={() => {
          void copy(calendarUrl)
        }}
      >
        {hasCopied ? "Kopiert" : "Kopier lenke"}
      </Button>

      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {hasCopied ? "Kalenderlenken er kopiert til utklippstavlen." : ""}
      </span>
    </div>
  )
}
