import {
  getSidequestRegistrationsWithAndWithoutSpot,
  getSidequestUserRegistrationState,
  type SidequestRegistrationUser,
  type SidequestSummary,
} from "@dotkomonline/rpc/sidequest"
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
import Link from "next/link"

const MAX_USERS_TO_SHOW = 2

interface Props {
  sidequest: SidequestSummary
  eventHasEnded: boolean
  userId: string | null
  variant?: "compact" | "box"
}

export const SidequestRegistrations = ({ sidequest, eventHasEnded, userId, variant = "compact" }: Props) => {
  const { registrationsWithSpot, waitlist } = getSidequestRegistrationsWithAndWithoutSpot(sidequest)
  const { isUserRegistered, isUserOnWaitlist, waitlistPosition } = getSidequestUserRegistrationState(userId, sidequest)
  const occupancyText = sidequest.capacity !== null ? `${registrationsWithSpot.length}/${sidequest.capacity}` : null
  const waitlistText = waitlist.length > 0 ? ` + ${waitlist.length} i kø` : null
  const title = getSummaryTitle({
    registrationCount: occupancyText !== null ? registrationsWithSpot.length : sidequest.registrations.length,
    occupancyText,
    waitlistText,
    isUserRegistered,
    isUserOnWaitlist,
    waitlistPosition,
    eventHasEnded,
    variant,
  })

  const users = [...registrationsWithSpot, ...waitlist]
    .map((registration) => registration.user)
    .filter((user) => user !== null)
  const visibleUsers =
    userId === null
      ? users
      : [...users.filter((user) => user.id === userId), ...users.filter((user) => user.id !== userId)]
  const canViewWhoIsRegistered = userId !== null && visibleUsers.length > 0
  const hasSummary = title !== null || occupancyText !== null || waitlistText !== null

  if (variant === "box") {
    return (
      <RegistrationsBox
        title={title}
        occupancyText={occupancyText}
        waitlistText={waitlistText}
        canViewWhoIsRegistered={canViewWhoIsRegistered}
        registrationCount={sidequest.registrations.length}
        userId={userId}
        registrationsWithSpot={registrationsWithSpot}
        waitlist={waitlist}
      />
    )
  }

  if (!hasSummary) {
    return null
  }

  const summary = (
    <span className="flex items-center gap-1.5">
      {title}
      <Occupancy occupancyText={occupancyText} waitlistText={waitlistText} />
    </span>
  )

  if (!canViewWhoIsRegistered || sidequest.registrations.length === 0) {
    return <Text className="flex h-7 items-center text-xs text-muted-foreground">{summary}</Text>
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
          <Text className="text-xs text-muted-foreground">{summary}</Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-1" initialFocus={false}>
        <RegistrationsList registrationsWithSpot={registrationsWithSpot} waitlist={waitlist} userId={userId} />
      </PopoverContent>
    </Popover>
  )
}

const Occupancy = ({ occupancyText, waitlistText }: { occupancyText: string | null; waitlistText: string | null }) => {
  if (occupancyText === null && waitlistText === null) {
    return null
  }

  return (
    <>
      {occupancyText !== null && <span className="font-mono">{occupancyText}</span>}
      {waitlistText !== null && <span>{waitlistText}</span>}
    </>
  )
}

const RegistrationsBox = ({
  title,
  occupancyText,
  waitlistText,
  canViewWhoIsRegistered,
  registrationCount,
  userId,
  registrationsWithSpot,
  waitlist,
}: {
  title: string | null
  occupancyText: string | null
  waitlistText: string | null
  canViewWhoIsRegistered: boolean
  registrationCount: number
  userId: string | null
  registrationsWithSpot: SidequestSummary["registrations"]
  waitlist: SidequestSummary["registrations"]
}) => {
  if (title === null && occupancyText === null && waitlistText === null) {
    return null
  }

  const isClickable = canViewWhoIsRegistered && registrationCount > 0
  const hasOccupancy = occupancyText !== null || waitlistText !== null

  const content = (
    <>
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50 dark:border-stone-600 dark:bg-stone-700">
        <IconUsers className="size-6 shrink-0 text-muted-foreground" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        {title !== null && <Text className="truncate">{title}</Text>}
        {hasOccupancy && (
          <Text className="truncate text-xs text-muted-foreground">
            <Occupancy occupancyText={occupancyText} waitlistText={waitlistText} />
          </Text>
        )}
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
    "flex min-w-0 w-[calc(100%+1rem)] flex-row items-center gap-3 rounded-xl p-2 -mx-2 text-left font-normal sm:gap-4",
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
        <RegistrationsList registrationsWithSpot={registrationsWithSpot} waitlist={waitlist} userId={userId} />
      </PopoverContent>
    </Popover>
  )
}

const UserAvatar = ({ user, isCurrentUser = false }: { user: SidequestRegistrationUser; isCurrentUser?: boolean }) => {
  const displayName = user.name ?? user.username

  return (
    <Avatar
      size="sm"
      className={cn(isCurrentUser && "outline-2 -outline-offset-1 outline-blue-500 dark:outline-sky-800")}
    >
      <AvatarImage src={user.imageUrl ?? undefined} alt={displayName} />
      <AvatarFallback>{displayName.slice(0, 1).toLocaleUpperCase("nb")}</AvatarFallback>
    </Avatar>
  )
}

const UserAvatarList = ({ users }: { users: SidequestRegistrationUser[] }) => {
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

const RegistrationsList = ({
  registrationsWithSpot,
  waitlist,
  userId,
}: {
  registrationsWithSpot: SidequestSummary["registrations"]
  waitlist: SidequestSummary["registrations"]
  userId: string | null
}) => {
  return (
    <div className="max-h-60 overflow-y-auto">
      <RegistrationGroup title="Påmeldte" registrations={registrationsWithSpot} userId={userId} />
      {waitlist.length > 0 && (
        <RegistrationGroup title="Venteliste" registrations={waitlist} userId={userId} numbered />
      )}
    </div>
  )
}

const RegistrationGroup = ({
  title,
  registrations,
  userId,
  numbered = false,
}: {
  title: string
  registrations: SidequestSummary["registrations"]
  userId: string | null
  numbered?: boolean
}) => {
  return (
    <div className="flex flex-col">
      <Text className="sticky top-0 z-10 bg-popover px-2 py-1 text-xs text-muted-foreground">{title}</Text>
      {registrations.length === 0 ? (
        <Text className="px-2 py-1.5 text-sm text-muted-foreground">Ingen påmeldte</Text>
      ) : (
        <ul>
          {registrations.map((registration, index) => {
            if (registration.user === null) {
              return null
            }

            const displayName = registration.user.name ?? registration.user.username
            const isCurrentUser = userId !== null && registration.user.id === userId

            return (
              <li key={registration.id}>
                <Link
                  href={`/profil/${registration.user.username}`}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5",
                    !isCurrentUser && "hover:bg-gray-100 dark:hover:bg-stone-800",
                    isCurrentUser && "bg-blue-100 hover:bg-blue-200 dark:bg-sky-950 dark:hover:bg-sky-900"
                  )}
                >
                  {numbered && (
                    <Text className="w-4 text-right font-mono text-xs tabular-nums text-muted-foreground">
                      {index + 1}.
                    </Text>
                  )}
                  <UserAvatar user={registration.user} isCurrentUser={isCurrentUser} />
                  <Text
                    className={cn("text-sm", isCurrentUser ? "text-black dark:text-white" : "text-muted-foreground")}
                  >
                    {displayName}
                  </Text>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function getSummaryTitle({
  registrationCount,
  occupancyText,
  waitlistText,
  isUserRegistered,
  isUserOnWaitlist,
  waitlistPosition,
  eventHasEnded,
  variant,
}: {
  registrationCount: number
  occupancyText: string | null
  waitlistText: string | null
  isUserRegistered: boolean
  isUserOnWaitlist: boolean
  waitlistPosition: number | null
  eventHasEnded: boolean
  variant: "compact" | "box"
}): string | null {
  if (variant === "compact" && (occupancyText !== null || waitlistText !== null)) {
    return null
  }

  if (registrationCount === 0) {
    if (variant === "compact" || eventHasEnded) {
      return null
    }

    return "Ingen har blitt med ennå"
  }

  if (waitlistPosition !== null) {
    return `Du er ${waitlistPosition}. i køen`
  }

  if (isUserRegistered && !isUserOnWaitlist) {
    if (registrationCount === 1) {
      return eventHasEnded ? "Bare deg" : "Bare deg foreløpig"
    }

    return `Du og ${registrationCount - 1} andre`
  }

  if (occupancyText !== null) {
    return "Påmeldte"
  }

  if (eventHasEnded) {
    return `${registrationCount} ble med`
  }

  return `${registrationCount} blir med`
}
