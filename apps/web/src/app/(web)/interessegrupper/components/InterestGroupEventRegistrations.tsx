import type {
  InterestGroupEventRegistrationUser,
  InterestGroupEventSummary,
} from "@dotkomonline/rpc/interest-group-event"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  Button,
  cn,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Text,
} from "@dotkomonline/ui"
import { IconChevronRight, IconUsers } from "@tabler/icons-react"
import { compareDesc } from "date-fns"
import Link from "next/link"

const MAX_USERS_TO_SHOW = 2

interface Props {
  registrations: InterestGroupEventSummary["registrations"]
  eventHasEnded: boolean
  userId: string | null
  variant?: "compact" | "box"
}

export const InterestGroupEventRegistrations = ({
  registrations,
  eventHasEnded,
  userId,
  variant = "compact",
}: Props) => {
  const sortedRegistrations = registrations.toSorted((left, right) => {
    if (left.userId === userId) {
      return -1
    }

    if (right.userId === userId) {
      return 1
    }

    return compareDesc(right.createdAt, left.createdAt)
  })

  const summaryText = getSummaryText(sortedRegistrations, eventHasEnded, userId, variant)
  const visibleUsers = sortedRegistrations.map((registration) => registration.user).filter((user) => user !== null)
  const canViewWhoIsRegistered = userId !== null && visibleUsers.length > 0

  if (variant === "box") {
    return (
      <RegistrationsBox
        registrations={sortedRegistrations}
        summaryText={summaryText}
        canViewWhoIsRegistered={canViewWhoIsRegistered}
      />
    )
  }

  if (summaryText === null) {
    return null
  }

  if (!canViewWhoIsRegistered || sortedRegistrations.length === 0) {
    return <Text className="flex h-7 items-center text-xs text-muted-foreground">{summaryText}</Text>
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={cn(
            "group/registrations z-10 h-7 gap-2 px-1 pr-2 py-0.5!",
            "text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground dark:hover:bg-stone-700"
          )}
        >
          <UserAvatarList users={visibleUsers} />

          <Text className="text-xs text-muted-foreground">{summaryText}</Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-1" initialFocus={false}>
        <RegistrationsList registrations={sortedRegistrations} />
      </PopoverContent>
    </Popover>
  )
}

const RegistrationsBox = ({
  registrations,
  summaryText,
  canViewWhoIsRegistered,
}: {
  registrations: InterestGroupEventSummary["registrations"]
  summaryText: string | null
  canViewWhoIsRegistered: boolean
}) => {
  if (summaryText === null) {
    return null
  }

  const isClickable = canViewWhoIsRegistered && registrations.length > 0

  const content = (
    <>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-gray-200 dark:border-stone-700 dark:bg-stone-800">
        <IconUsers className="size-6 shrink-0 text-muted-foreground" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <Text className="truncate">{summaryText}</Text>
      </div>

      {isClickable && (
        <IconChevronRight
          aria-hidden
          className="size-5 shrink-0 text-muted-foreground transition-[transform,color] group-hover/registrations-box:translate-x-0.5 group-hover/registrations-box:text-foreground"
        />
      )}
    </>
  )

  const boxClassName = cn(
    "flex w-full min-w-0 flex-row items-center gap-3 rounded-xl p-2 -mx-2 text-left font-normal sm:gap-4",
    isClickable && "group/registrations-box transition-colors hover:bg-gray-100 dark:hover:bg-stone-800"
  )

  if (!isClickable) {
    return <section className={boxClassName}>{content}</section>
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="unstyled" className={boxClassName}>
          {content}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-1" initialFocus={false}>
        <RegistrationsList registrations={registrations} />
      </PopoverContent>
    </Popover>
  )
}

const UserAvatar = ({ user }: { user: InterestGroupEventRegistrationUser }) => {
  const displayName = user.name ?? user.username

  return (
    <Avatar size="sm">
      <AvatarImage src={user.imageUrl ?? undefined} alt={displayName} />
      <AvatarFallback>{displayName.slice(0, 1).toLocaleUpperCase("nb")}</AvatarFallback>
    </Avatar>
  )
}

const UserAvatarList = ({ users }: { users: InterestGroupEventRegistrationUser[] }) => {
  const visibleUsers = users.slice(0, MAX_USERS_TO_SHOW)
  const hiddenCount = users.length - MAX_USERS_TO_SHOW

  return (
    <AvatarGroup
      className={cn(
        "*:data-[slot=avatar]:ring-background *:data-[slot=avatar]:transition-shadow",
        "group-hover:*:data-[slot=avatar]:ring-gray-50 dark:group-hover:*:data-[slot=avatar]:ring-stone-800",
        "group-hover/registrations:*:data-[slot=avatar]:ring-gray-100 dark:group-hover/registrations:*:data-[slot=avatar]:ring-stone-700"
      )}
    >
      {visibleUsers.map((user) => (
        <UserAvatar key={user.id} user={user} />
      ))}
      {hiddenCount > 0 && (
        <AvatarGroupCount
          className={cn(
            "size-6 text-[10px] ring-background transition-shadow",
            "group-hover:ring-gray-50 dark:group-hover:ring-stone-800",
            "group-hover/registrations:ring-gray-100 dark:group-hover/registrations:ring-stone-700"
          )}
        >
          +{hiddenCount}
        </AvatarGroupCount>
      )}
    </AvatarGroup>
  )
}

const RegistrationsList = ({ registrations }: { registrations: InterestGroupEventSummary["registrations"] }) => {
  return (
    <ul className="max-h-60 overflow-y-auto">
      {registrations.map((registration) => {
        if (registration.user === null) {
          return null
        }

        const displayName = registration.user.name ?? registration.user.username
        const profileHref = `/profil/${registration.user.username}`

        return (
          <li key={registration.id}>
            <Link
              href={profileHref}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-stone-800"
            >
              <UserAvatar user={registration.user} />
              <Text className="text-sm text-muted-foreground">{displayName}</Text>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

function getSummaryText(
  registrations: InterestGroupEventSummary["registrations"],
  eventHasEnded: boolean,
  userId: string | null,
  variant: "compact" | "box"
): string | null {
  const registrationCount = registrations.length
  const userIsRegistered = userId !== null && registrations.some((registration) => registration.userId === userId)

  if (registrationCount === 0) {
    if (variant === "compact" || eventHasEnded) {
      return null
    }

    return "Ingen har blitt med ennå"
  }

  if (userIsRegistered) {
    if (registrationCount === 1) {
      return eventHasEnded ? "Bare du" : "Bare du foreløpig"
    }

    if (eventHasEnded) {
      return `Du og ${registrationCount - 1} andre`
    }

    return `Du og ${registrationCount - 1} andre`
  }

  if (eventHasEnded) {
    return `${registrationCount} ble med`
  }

  return `${registrationCount} blir med`
}
