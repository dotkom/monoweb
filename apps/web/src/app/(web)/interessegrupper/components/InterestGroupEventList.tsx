"use client"

import { getActiveMembershipsForGroup, type GroupMembership } from "@dotkomonline/rpc/group"
import type { InterestGroupEventSummary } from "@dotkomonline/rpc/interest-group-event"
import { Text } from "@dotkomonline/ui"
import { LoadMoreSentinel } from "src/components/molecules/LoadMoreSentinel/LoadMoreSentinel"
import { InterestGroupEventCard, InterestGroupEventCardSkeleton } from "./InterestGroupEventCard"

interface Props {
  futureInterestGroupEvents: InterestGroupEventSummary[]
  pastInterestGroupEvents: InterestGroupEventSummary[]
  currentUserGroupMemberships: GroupMembership[]
  fetchNextFuturePage: () => void
  isFetchingNextFuturePage: boolean
  hasNextFuturePage: boolean
  fetchNextPastPage: () => void
  isFetchingNextPastPage: boolean
  hasNextPastPage: boolean
  isPlaceholderData: boolean
  isLoading: boolean
  isLoggedIn: boolean
  onRegistrationToggle: (interestGroupEvent: InterestGroupEventSummary) => void
}

export const InterestGroupEventList = ({
  futureInterestGroupEvents,
  pastInterestGroupEvents,
  currentUserGroupMemberships,
  fetchNextFuturePage,
  isFetchingNextFuturePage,
  hasNextFuturePage,
  fetchNextPastPage,
  isFetchingNextPastPage,
  hasNextPastPage,
  isPlaceholderData,
  isLoading,
  isLoggedIn,
  onRegistrationToggle,
}: Props) => {
  const showInitialSkeleton =
    isLoading && futureInterestGroupEvents.length === 0 && pastInterestGroupEvents.length === 0

  if (showInitialSkeleton) {
    return (
      <div className="flex w-full flex-col gap-8" aria-busy={true}>
        <InterestGroupEventListSkeleton />
      </div>
    )
  }

  return (
    <div
      className="flex w-full flex-col gap-8"
      aria-busy={isFetchingNextFuturePage || isFetchingNextPastPage || isLoading}
    >
      <div className="flex flex-col gap-2">
        {futureInterestGroupEvents.map((interestGroupEvent) => (
          <WrappedInterestGroupEventCard
            key={interestGroupEvent.id}
            interestGroupEvent={interestGroupEvent}
            currentUserGroupMemberships={currentUserGroupMemberships}
            isLoggedIn={isLoggedIn}
            onRegistrationToggle={onRegistrationToggle}
          />
        ))}
      </div>

      {isFetchingNextFuturePage && <InterestGroupEventListSkeleton />}
      <LoadMoreSentinel
        fetchNextPage={fetchNextFuturePage}
        hasNextPage={hasNextFuturePage}
        isFetchingNextPage={isFetchingNextFuturePage}
        isPlaceholderData={isPlaceholderData}
        isLoading={isLoading}
      />

      {pastInterestGroupEvents.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex w-full min-w-0 flex-row items-center gap-2">
            <span className="h-0.5 grow rounded-full bg-gray-200 dark:bg-stone-700" />
            <Text className="shrink-0 text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-stone-600">
              Tidligere arrangementer
            </Text>
            <span className="h-0.5 grow rounded-full bg-gray-200 dark:bg-stone-700" />
          </div>

          {pastInterestGroupEvents.map((interestGroupEvent) => (
            <WrappedInterestGroupEventCard
              key={interestGroupEvent.id}
              interestGroupEvent={interestGroupEvent}
              currentUserGroupMemberships={currentUserGroupMemberships}
              isLoggedIn={isLoggedIn}
              onRegistrationToggle={onRegistrationToggle}
            />
          ))}
        </div>
      )}
      {isFetchingNextPastPage && <InterestGroupEventListSkeleton />}
      <LoadMoreSentinel
        fetchNextPage={fetchNextPastPage}
        hasNextPage={hasNextPastPage}
        isFetchingNextPage={isFetchingNextPastPage}
        isPlaceholderData={isPlaceholderData}
        isLoading={isLoading}
      />
    </div>
  )
}

interface WrappedInterestGroupEventCardProps {
  interestGroupEvent: InterestGroupEventSummary
  currentUserGroupMemberships: GroupMembership[]
  isLoggedIn: boolean
  onRegistrationToggle: (interestGroupEvent: InterestGroupEventSummary) => void
}

const WrappedInterestGroupEventCard = ({
  interestGroupEvent,
  currentUserGroupMemberships,
  isLoggedIn,
  onRegistrationToggle,
}: WrappedInterestGroupEventCardProps) => {
  const activeMemberships = getActiveMembershipsForGroup(
    currentUserGroupMemberships,
    interestGroupEvent.interestGroup.slug
  )
  const hasAppointedRole = activeMemberships.some((membership) => membership.roles.length > 0)
  const isActiveMember = activeMemberships.length > 0

  return (
    <InterestGroupEventCard
      interestGroupEvent={interestGroupEvent}
      isCurrentUserMemberOfInterestGroup={isActiveMember}
      hasAppointedRole={hasAppointedRole}
      isLoggedIn={isLoggedIn}
      onRegistrationToggle={onRegistrationToggle}
    />
  )
}

const InterestGroupEventListSkeleton = () => {
  const NEXT_PAGE_SKELETONS = 5
  return Array.from({ length: NEXT_PAGE_SKELETONS }, (_, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: index is fine for non-reordering skeleton list
    <InterestGroupEventCardSkeleton key={i} />
  ))
}
