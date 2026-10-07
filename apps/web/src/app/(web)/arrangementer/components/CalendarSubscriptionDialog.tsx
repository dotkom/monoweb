"use client"

import { env } from "@/env"
import { useCopyToClipboard } from "@/utils/use-copy-to-clipboard"
import { useAuthenticatedUser } from "@/utils/use-authenticated-user"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  type ButtonProps,
  Text,
  Title,
  ToggleGroup,
  ToggleGroupItem,
} from "@dotkomonline/ui"
import { createAuthorizeUrl } from "@dotkomonline/utils"
import {
  IconCalendarEvent,
  IconCalendarPlus,
  IconCheck,
  IconCopy,
  IconLoader2,
  IconUser,
  IconX,
} from "@tabler/icons-react"
import { useQuery } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"
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

export function CalendarSubscriptionDialog({
  triggerVariant = "ghost",
  trigger,
}: {
  triggerVariant?: ButtonProps["variant"]
  trigger?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { dbUser } = useAuthenticatedUser()
  const isLoggedIn = Boolean(dbUser)
  const [selectedFeed, setSelectedFeed] = useState<CalendarFeed>("personal")

  const personalCalendarTokenQuery = useQuery({
    queryKey: ["calendar", "me"],
    queryFn: fetchPersonalCalendarToken,
    enabled: open && isLoggedIn,
  })

  const allEventsCalendarUrl = createAllEventsCalendarUrl(env.NEXT_PUBLIC_ORIGIN)
  const personalCalendarUrl = personalCalendarTokenQuery.data
    ? createPersonalCalendarSubscriptionUrl(env.NEXT_PUBLIC_ORIGIN, personalCalendarTokenQuery.data)
    : ""

  const isPersonalFeed = selectedFeed === "personal"
  const selectedCalendarUrl = isPersonalFeed ? personalCalendarUrl : allEventsCalendarUrl
  const selectedFeedDescription = isPersonalFeed
    ? isLoggedIn
      ? "Arrangementer du er påmeldt. Lenken er personlig, så ikke del den."
      : "Logg inn for å abonnere på arrangementene du er påmeldt."
    : "Offentlige arrangementer fra Online."

  let dialogTrigger = trigger
  if (!dialogTrigger) {
    dialogTrigger = (
      <Button
        variant={triggerVariant}
        className="h-10 rounded-lg shrink-0"
        icon={<IconCalendarPlus className="size-4" />}
        onClick={() => setOpen(true)}
      >
        <Text element="span" className="max-sm:hidden">
          Abonner på kalender
        </Text>
        <Text element="span" className="sm:hidden">
          Abonner
        </Text>
      </Button>
    )
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)

        if (nextOpen) {
          setSelectedFeed(isLoggedIn ? "personal" : "all")
        }
      }}
    >
      <AlertDialogTrigger asChild>{dialogTrigger}</AlertDialogTrigger>
      <AlertDialogContent
        size="lg"
        className="max-h-[90dvh] min-w-0 overflow-x-hidden overflow-y-auto"
        onOutsideClick={() => setOpen(false)}
      >
        <div className="flex flex-row gap-4 justify-between">
          <AlertDialogTitle asChild>
            <Title element="h2" size="lg">
              Abonner på kalender
            </Title>
          </AlertDialogTitle>
          <AlertDialogCancel>
            <IconX className="size-[1.25em]" />
          </AlertDialogCancel>
        </div>

        <ToggleGroup
          className="h-12"
          spacing={0}
          color="blue"
          multiple={false}
          value={[selectedFeed]}
          onValueChange={(value) => {
            const nextFeed = value.at(0)

            if (nextFeed === "personal" || nextFeed === "all") {
              setSelectedFeed(nextFeed)
            }
          }}
        >
          <ToggleGroupItem value="personal" className="flex flex-1 flex-row items-center justify-center gap-2 h-full">
            <UserProfileAvatar imageUrl={dbUser?.imageUrl} name={dbUser?.name} />
            <Text element="span">Mine arrangementer</Text>
          </ToggleGroupItem>
          <ToggleGroupItem value="all" className="flex flex-1 flex-row items-center justify-center gap-2 h-full">
            <IconCalendarEvent className="size-5 text-muted-foreground" />
            <Text element="span">Alle arrangementer</Text>
          </ToggleGroupItem>
        </ToggleGroup>
        <Text className="text-sm">{selectedFeedDescription}</Text>
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
          <CalendarFeedActions
            calendarName={isPersonalFeed ? "Dine arrangementer" : "Alle arrangementer"}
            calendarUrl={selectedCalendarUrl}
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
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
    <div className="flex flex-col gap-2 sm:flex-row">
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
