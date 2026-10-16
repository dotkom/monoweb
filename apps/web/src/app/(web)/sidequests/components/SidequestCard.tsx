import { GroupLogo } from "@/components/atoms/GroupLogo"
import { DateAndTime } from "@/components/molecules/EventListItem/DateAndTime"
import { useUser } from "@auth0/nextjs-auth0"
import { createGroupPageUrl, getGroupDisplayName } from "@dotkomonline/rpc/group"
import {
  getSidequestUserRegistrationState,
  hasSidequestEnded,
  type SidequestSummary,
} from "@dotkomonline/rpc/sidequest"
import { cn, Title } from "@dotkomonline/ui"
import { createSidequestPageUrl } from "@dotkomonline/utils"
import { IconBellFilled, IconChevronRight, IconShieldFilled } from "@tabler/icons-react"
import Link from "next/link"
import { PlaceHolderImage } from "@/components/atoms/PlaceHolderImage"
import { SidequestJoinButton } from "./SidequestJoinButton"
import { SidequestRegistrations } from "./SidequestRegistrations"

export interface SidequestCardProps {
  sidequest: SidequestSummary
  isCurrentUserMemberOfInterestGroup: boolean
  hasNonDefaultRole: boolean
  isLoggedIn: boolean
  className?: string
  onRegistrationToggle?: (sidequest: SidequestSummary) => void
  compact?: boolean
}

export const SidequestCard = ({
  sidequest,
  isCurrentUserMemberOfInterestGroup,
  hasNonDefaultRole,
  isLoggedIn,
  className,
  onRegistrationToggle,
  compact = false,
}: SidequestCardProps) => {
  const { user } = useUser()
  const userId = user?.sub

  const interestGroup = sidequest.interestGroup
  const displayName = getGroupDisplayName(interestGroup)
  const isEndInPast = hasSidequestEnded(sidequest)
  const { isUserRegistered, isUserOnWaitlist, waitlistPosition, isAtCapacity } = getSidequestUserRegistrationState(
    userId ?? null,
    sidequest
  )

  return (
    <article
      className={cn(
        "group relative flex flex-col rounded-xl p-2 -mx-2 last:-mb-2",
        "sm:flex-row",
        "hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors",
        compact ? "gap-3" : "gap-4",
        isEndInPast && "text-gray-600 dark:text-stone-200 hover:text-gray-800 dark:hover:text-stone-300",
        className
      )}
    >
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-gray-100 dark:bg-stone-800",
          "aspect-video w-full",
          compact ? "rounded-sm sm:h-16 sm:w-auto" : "rounded-md sm:h-22 sm:w-auto lg:h-28"
        )}
      >
        {sidequest.imageUrl ? (
          // biome-ignore lint/performance/noImgElement: unoptimized next/image crashes iOS Safari (#3062)
          <img
            src={sidequest.imageUrl}
            alt={sidequest.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <PlaceHolderImage variant="SOCIAL" className="object-cover" alt={sidequest.title} />
        )}
      </div>

      <div className={cn("flex min-w-0 flex-1 flex-col", compact ? "gap-0.5" : "gap-2 sm:gap-1.5")}>
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
          {hasNonDefaultRole && <IconShieldFilled className="size-3 text-amber-500 dark:text-amber-400" />}
          {isCurrentUserMemberOfInterestGroup && !hasNonDefaultRole && (
            <IconBellFilled className="size-3 text-blue-500" />
          )}
        </div>

        <div className={cn("flex min-w-0 flex-col", compact ? "gap-0.5" : "gap-2 sm:gap-1.5")}>
          <Link
            href={createSidequestPageUrl(sidequest.id, sidequest.title)}
            scroll={false}
            className={cn(
              "text-left flex items-center gap-1",
              "after:absolute after:inset-0 after:z-0 after:rounded-xl",
              "focus-visible:after:ring-2 focus-visible:after:ring-ring/30"
            )}
          >
            <Title
              element="h3"
              size="sm"
              className={cn(
                "line-clamp-2 font-medium wrap-break-word",
                compact ? "text-xs sm:text-sm" : "text-lg sm:text-base"
              )}
            >
              {sidequest.title}
            </Title>

            {!compact && <IconChevronRight className="hidden group-hover:block size-4 text-muted-foreground" />}
          </Link>

          <DateAndTime start={sidequest.start} end={sidequest.end} compact={compact} stackAt={false} />

          {!compact && (
            <div className="mt-1 flex flex-row-reverse sm:flex-row justify-between sm:justify-start items-center gap-1 sm:mt-0.5">
              <SidequestJoinButton
                isLoggedIn={isLoggedIn}
                isUserRegistered={isUserRegistered}
                isUserOnWaitlist={isUserOnWaitlist}
                waitlistPosition={waitlistPosition}
                isAtCapacity={isAtCapacity}
                eventHasEnded={isEndInPast}
                registerEnd={sidequest.registerEnd}
                deregisterDeadline={sidequest.deregisterDeadline}
                onRegistrationClick={() => {
                  if (onRegistrationToggle !== undefined) {
                    onRegistrationToggle(sidequest)
                  }
                }}
                size="sm"
                className="relative z-10 w-fit"
              />

              <SidequestRegistrations sidequest={sidequest} eventHasEnded={isEndInPast} userId={userId ?? null} />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export const SidequestCardSkeleton = () => {
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
