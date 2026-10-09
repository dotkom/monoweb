"use client"

import { env } from "@/env"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import { useCopyToClipboard } from "@/utils/use-copy-to-clipboard"
import { useFullPathname } from "@/utils/use-full-pathname"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Text,
  Title,
  ToggleGroup,
  ToggleGroupItem,
  cn,
} from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import { IconArrowUpRight, IconCalendarEvent, IconCheck, IconCopy, IconLoader2, IconUser } from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import Image from "next/image"
import { useState } from "react"
import { AppleCalendarLogo } from "./AppleCalendarLogo"
import {
  createAllEventsCalendarUrl,
  createGoogleCalendarSubscribeUrl,
  createOutlookCalendarSubscribeUrl,
  createPersonalCalendarSubscriptionUrl,
  createWebcalUrl,
  fetchPersonalCalendarToken,
} from "./calendar-subscription"

type CalendarFeed = "personal" | "all"

export function CalendarSubscriptionPanel({ enabled = true }: { enabled?: boolean }) {
  const [selectedFeed, setSelectedFeed] = useState<CalendarFeed>("personal")

  const { dbUser, isLoading: authLoading } = useAuthenticatedUser()
  const fullPathname = useFullPathname()
  const isPersonalFeed = selectedFeed === "personal"

  const personalCalendarTokenQuery = useQuery({
    queryKey: ["calendar", "me", dbUser?.id ?? null],
    queryFn: fetchPersonalCalendarToken,
    enabled: enabled && dbUser !== null && isPersonalFeed,
  })

  const personalToken = personalCalendarTokenQuery.data ?? null

  let calendarUrl: string | null = createAllEventsCalendarUrl(env.NEXT_PUBLIC_ORIGIN)
  let description = "Offentlige arrangementer fra Online."
  let calendarName = "Alle arrangementer"

  if (isPersonalFeed) {
    calendarUrl =
      personalToken === null ? null : createPersonalCalendarSubscriptionUrl(env.NEXT_PUBLIC_ORIGIN, personalToken)
    description = "Lenkene er personlige, så ikke del dem med andre."
    calendarName = "Dine arrangementer"
  }

  const isLoading = isPersonalFeed && (authLoading || personalCalendarTokenQuery.isLoading)
  const requiresLogin = isPersonalFeed && authLoading === false && dbUser === null
  const hasError = isPersonalFeed && dbUser !== null && personalCalendarTokenQuery.isError

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Title element="h3" size="sm" className="text-base">
          Arrangementer i kalenderen
        </Title>

        <Text className="text-sm text-muted-foreground">Velg hvilke arrangementer du vil abonnere på.</Text>
      </div>

      <ToggleGroup
        aria-label="Velg arrangementer i kalenderen"
        multiple={false}
        spacing={0}
        color="blue"
        className="h-12 w-full"
        value={[selectedFeed]}
        onValueChange={(values) => {
          const nextFeed = values.at(0)

          if (nextFeed === "personal" || nextFeed === "all") {
            setSelectedFeed(nextFeed)
          }
        }}
      >
        <ToggleGroupItem value="personal" className="h-full min-w-0 flex-1 gap-2">
          <Avatar className="size-5 shrink-0">
            <AvatarImage src={dbUser?.imageUrl ?? undefined} alt="" />
            <AvatarFallback className="bg-gray-200 dark:bg-stone-700">
              <IconUser className="size-3.5" />
            </AvatarFallback>
          </Avatar>
          <span className="whitespace-normal text-sm leading-tight">Alle du er påmeldt</span>
        </ToggleGroupItem>

        <ToggleGroupItem value="all" className="h-full min-w-0 flex-1 gap-2">
          <IconCalendarEvent className="size-4.5 shrink-0" />
          <span className="whitespace-normal text-sm leading-tight">Alle arrangementer</span>
        </ToggleGroupItem>
      </ToggleGroup>

      {requiresLogin ? (
        <div className="flex flex-col items-start gap-3">
          <Text className="text-sm text-muted-foreground">
            Logg inn for å abonnere på arrangementene du er påmeldt.
          </Text>
          <Button element="a" href={createAuthorizeUrl({ returnTo: fullPathname })}>
            Logg inn
          </Button>
        </div>
      ) : (
        <Text className="text-xs text-muted-foreground">{description}</Text>
      )}

      {isLoading && (
        <div role="status" className="flex items-center gap-2 text-muted-foreground">
          <IconLoader2 aria-hidden className="size-4 animate-spin" />
          <Text className="text-sm">Henter kalenderlenke…</Text>
        </div>
      )}

      {hasError && (
        <div role="alert" className="flex flex-col items-start gap-3">
          <Text className="text-sm text-red-600 dark:text-red-400">Kunne ikke hente kalenderlenken.</Text>
          <Button
            variant="outline"
            onClick={() => {
              void personalCalendarTokenQuery.refetch()
            }}
          >
            Prøv igjen
          </Button>
        </div>
      )}

      {calendarUrl !== null && isLoading === false && requiresLogin === false && hasError === false && (
        <CalendarFeedActions
          key={calendarUrl}
          calendarName={calendarName}
          calendarUrl={calendarUrl}
          feedLabel={isPersonalFeed ? "Arrangementer du er påmeldt" : "Alle arrangementer fra Online"}
        />
      )}
    </div>
  )
}

function CalendarFeedActions({
  calendarName,
  calendarUrl,
  feedLabel,
}: {
  calendarName: string
  calendarUrl: string
  feedLabel: string
}) {
  const { icon: copiedIcon, copy } = useCopyToClipboard()
  const hasCopied = copiedIcon === "check"
  const CopyIcon = hasCopied ? IconCheck : IconCopy

  const googleCalendarUrl = createGoogleCalendarSubscribeUrl(calendarUrl)
  const outlookCalendarUrl = createOutlookCalendarSubscribeUrl(calendarUrl, calendarName)
  const appleCalendarUrl = createWebcalUrl(calendarUrl)

  return (
    <div className="flex flex-col gap-2">
      <Button
        element="a"
        variant="outline"
        href={googleCalendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="h-14 w-full justify-start gap-3"
      >
        <Image src="/logo-google-calendar.svg" alt="" width={16} height={16} />
        <span className="flex flex-col items-start">
          <span>Google Kalender</span>
          <span className="text-xs font-normal text-muted-foreground">{feedLabel}</span>
        </span>
        <IconArrowUpRight aria-hidden className="ml-auto size-4 text-muted-foreground" />
      </Button>

      <Button
        element="a"
        variant="outline"
        href={outlookCalendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="h-14 w-full justify-start gap-3"
      >
        <Image src="/logo-microsoft-outlook.svg" alt="" width={16} height={16} />
        <span className="flex flex-col items-start">
          <span>Outlook</span>
          <span className="text-xs font-normal text-muted-foreground">{feedLabel}</span>
        </span>
        <IconArrowUpRight aria-hidden className="ml-auto size-4 text-muted-foreground" />
      </Button>

      <Button element="a" variant="outline" href={appleCalendarUrl} className="h-14 w-full justify-start gap-3">
        <AppleCalendarLogo />
        <span className="flex flex-col items-start">
          <span>Apple Kalender</span>
          <span className="text-xs font-normal text-muted-foreground">{feedLabel}</span>
        </span>
        <IconArrowUpRight aria-hidden className="ml-auto size-4 text-muted-foreground" />
      </Button>

      <Button
        variant="outline"
        className="h-14 w-full justify-start gap-3"
        onClick={() => {
          void copy(calendarUrl)
        }}
      >
        <CopyIcon aria-hidden className={cn("size-4", hasCopied && "text-green-600 dark:text-green-400")} />
        <span className="flex flex-col items-start">
          <span>{hasCopied ? "Kopiert" : "Kopier lenke"}</span>
          <span className="text-xs font-normal text-muted-foreground">{feedLabel}</span>
        </span>
      </Button>

      <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {hasCopied ? "Kalenderlenken er kopiert til utklippstavlen." : ""}
      </span>
    </div>
  )
}
