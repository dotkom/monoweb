import { GroupLogo } from "@/components/atoms/GroupLogo"
import { DateAndTime } from "@/components/molecules/EventListItem/DateAndTime"
import { useUser } from "@auth0/nextjs-auth0"
import { createInterestGroupEventPageUrl } from "@dotkomonline/utils"
import { createGroupPageUrl, getGroupDisplayName } from "@dotkomonline/rpc/group"
import {
  type InterestGroupEventSummary,
  isUserRegisteredForInterestGroupEvent,
} from "@dotkomonline/rpc/interest-group-event"
import { cn, Title } from "@dotkomonline/ui"
import { IconBellFilled, IconChevronRight, IconShieldFilled } from "@tabler/icons-react"
import { isPast } from "date-fns"
import Link from "next/link"
import { InterestGroupEventRegistrations } from "./InterestGroupEventRegistrations"
import { InterestGroupEventJoinButton } from "./InterestGroupEventJoinButton"

export interface InterestGroupEventCardProps {
  interestGroupEvent: InterestGroupEventSummary
  isCurrentUserMemberOfInterestGroup: boolean
  hasAppointedRole: boolean
  isLoggedIn: boolean
  className?: string
  onRegistrationToggle: (interestGroupEvent: InterestGroupEventSummary) => void
}

export const InterestGroupEventCard = ({
  interestGroupEvent,
  isCurrentUserMemberOfInterestGroup,
  hasAppointedRole,
  isLoggedIn,
  className,
  onRegistrationToggle,
}: InterestGroupEventCardProps) => {
  const { user } = useUser()
  const userId = user?.sub

  const interestGroup = interestGroupEvent.interestGroup
  const displayName = getGroupDisplayName(interestGroup)
  const isEndInPast = isPast(interestGroupEvent.end)

  const isUserRegisteredForEvent =
    userId !== undefined ? isUserRegisteredForInterestGroupEvent(userId, interestGroupEvent) : false

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl p-2 -mx-2 last:-mb-2",
        "sm:flex-row",
        "hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors",
        isEndInPast && "text-gray-600 dark:text-stone-200 hover:text-gray-800 dark:hover:text-stone-300",
        className
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-md bg-gray-100 dark:bg-stone-800",
          "aspect-video w-full",
          "sm:h-22 sm:w-auto lg:h-28"
        )}
      >
        {
          // biome-ignore lint/performance/noImgElement: unoptimized next/image crashes iOS Safari (#3062)
        } <img
          src={interestGroupEvent.imageUrl}
          alt={interestGroupEvent.title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-1.5">
        <div className="flex items-center justify-start gap-1.5">
          <Link
            href={createGroupPageUrl(interestGroup)}
            className="relative z-10 flex items-center justify-start gap-2 text-xs text-muted-foreground hover:underline hover:underline-offset-2"
          >
            <GroupLogo
              src={interestGroup.imageUrl}
              alt={displayName}
              height={16}
              width={16}
              containerClassName="rounded-full size-4 bg-gray-50 dark:bg-stone-700"
            />
            {displayName}
          </Link>
          {hasAppointedRole && <IconShieldFilled className="size-3 text-amber-500 dark:text-amber-400" />}
          {isCurrentUserMemberOfInterestGroup && !hasAppointedRole && (
            <IconBellFilled className="size-3 text-blue-500" />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:gap-1.5">
          <Link
            href={createInterestGroupEventPageUrl(interestGroupEvent.id, interestGroupEvent.title)}
            scroll={false}
            className={cn(
              "text-left flex items-center gap-1",
              "after:absolute after:inset-0 after:z-0 after:rounded-xl",
              "focus-visible:after:ring-2 focus-visible:after:ring-ring/30"
            )}
          >
            <Title element="h3" size="sm" className="line-clamp-2 text-lg font-medium wrap-break-word sm:text-base">
              {interestGroupEvent.title}
            </Title>

            <IconChevronRight className="hidden group-hover:block size-4 text-muted-foreground" />
          </Link>

          <DateAndTime start={interestGroupEvent.start} end={interestGroupEvent.end} stackAt={false} />

          <div className="mt-1 flex flex-row-reverse sm:flex-row justify-between sm:justify-start items-center gap-1 sm:mt-0.5">
            <InterestGroupEventJoinButton
              isLoggedIn={isLoggedIn}
              isUserRegistered={isUserRegisteredForEvent}
              eventHasEnded={isEndInPast}
              onRegistrationClick={() => onRegistrationToggle(interestGroupEvent)}
              size="sm"
              className="relative z-10 w-fit"
            />

            <InterestGroupEventRegistrations
              registrations={interestGroupEvent.registrations}
              eventHasEnded={isEndInPast}
              userId={userId ?? null}
            />
          </div>
        </div>
      </div>
    </article>
  )
}

export const InterestGroupEventCardSkeleton = () => {
  return (
    <div className="relative flex flex-col gap-4 rounded-xl p-2 -mx-2 last:-mb-2 sm:flex-row" aria-hidden>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-md",
          "aspect-video w-full",
          "sm:h-22 sm:w-[calc(5.5rem*16/9)]",
          "lg:h-28 lg:w-[calc(7rem*16/9)]"
        )}
      >
        <div className="skeleton absolute inset-0 bg-gray-300 dark:bg-stone-600" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-1.5">
        <div className="flex h-4 items-center gap-2">
          <div className="skeleton size-4 shrink-0 rounded-full bg-gray-300 dark:bg-stone-600" />
          <div className="skeleton h-3 w-24 rounded bg-gray-300 dark:bg-stone-600" />
        </div>

        <div className="flex min-w-0 flex-col gap-2 sm:gap-1.5">
          <div className="flex h-7 items-center sm:h-6">
            <div className="skeleton h-4.5 w-3/4 max-w-80 rounded sm:h-4 bg-gray-300 dark:bg-stone-600" />
          </div>
          <div className="flex h-4 items-center md:h-5">
            <div className="skeleton h-3 w-44 rounded md:h-3.5 bg-gray-300 dark:bg-stone-600" />
          </div>
          <div className="mt-1 flex h-7 items-center sm:mt-0.5">
            <div className="skeleton h-7 w-48 rounded-md bg-gray-300 dark:bg-stone-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
