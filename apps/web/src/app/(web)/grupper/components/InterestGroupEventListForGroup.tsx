"use client"

import type { TZDate } from "@date-fns/tz"
import type { GroupMembership } from "@dotkomonline/rpc/group"
import {
  isUserRegisteredForInterestGroupEvent,
  type InterestGroupEventSummary,
} from "@dotkomonline/rpc/interest-group-event"
import type { UserId } from "@dotkomonline/rpc/user"
import { InterestGroupEventList } from "../../interessegrupper/components/InterestGroupEventList"
import {
  getFutureInterestGroupEventsQuery,
  getPastInterestGroupEventsQuery,
} from "../../interessegrupper/interest-group-event-list-query"
import { useRegisterForInterestGroupEvent, useUnregisterFromInterestGroupEvent } from "../../interessegrupper/mutations"
import {
  useInterestGroupEventsInfiniteQuery,
  type InterestGroupEventFindManyPage,
} from "../../interessegrupper/queries"

interface Props {
  now: TZDate
  firstPageOfFutureInterestGroupEvents: InterestGroupEventFindManyPage
  firstPageOfPastInterestGroupEvents: InterestGroupEventFindManyPage
  userId: UserId | undefined
  interestGroupId: string
  currentUserGroupMemberships: GroupMembership[]
}

export function InterestGroupEventListForGroup({
  now,
  firstPageOfFutureInterestGroupEvents,
  firstPageOfPastInterestGroupEvents,
  userId,
  interestGroupId,
  currentUserGroupMemberships,
}: Props) {
  const registerForInterestGroupEventMutation = useRegisterForInterestGroupEvent()
  const unregisterFromInterestGroupEventMutation = useUnregisterFromInterestGroupEvent()

  const toggleInterestGroupEventRegistration = (interestGroupEvent: InterestGroupEventSummary) => {
    if (userId === undefined) {
      return
    }

    if (isUserRegisteredForInterestGroupEvent(userId, interestGroupEvent)) {
      unregisterFromInterestGroupEventMutation.mutate(interestGroupEvent.id)
    } else {
      registerForInterestGroupEventMutation.mutate(interestGroupEvent.id)
    }
  }

  const {
    interestGroupEvents: futureInterestGroupEvents,
    fetchNextPage: fetchNextFuturePage,
    hasNextPage: hasNextFuturePage,
    isFetchingNextPage: isFetchingNextFuturePage,
    isPlaceholderData: isFuturePlaceholderData,
    isLoading: isFutureLoading,
  } = useInterestGroupEventsInfiniteQuery(
    getFutureInterestGroupEventsQuery(now, [interestGroupId]),
    firstPageOfFutureInterestGroupEvents
  )

  const {
    interestGroupEvents: pastInterestGroupEvents,
    fetchNextPage: fetchNextPastPage,
    hasNextPage: hasNextPastPage,
    isFetchingNextPage: isFetchingNextPastPage,
    isPlaceholderData: isPastPlaceholderData,
    isLoading: isPastLoading,
  } = useInterestGroupEventsInfiniteQuery(
    getPastInterestGroupEventsQuery(now, [interestGroupId]),
    firstPageOfPastInterestGroupEvents
  )

  return (
    <InterestGroupEventList
      futureInterestGroupEvents={futureInterestGroupEvents}
      pastInterestGroupEvents={pastInterestGroupEvents}
      currentUserGroupMemberships={currentUserGroupMemberships}
      fetchNextFuturePage={fetchNextFuturePage}
      isFetchingNextFuturePage={isFetchingNextFuturePage}
      hasNextFuturePage={hasNextFuturePage}
      fetchNextPastPage={fetchNextPastPage}
      isFetchingNextPastPage={isFetchingNextPastPage}
      hasNextPastPage={hasNextPastPage}
      isPlaceholderData={isFuturePlaceholderData || isPastPlaceholderData}
      isLoading={isFutureLoading || isPastLoading}
      isLoggedIn={userId !== undefined}
      onRegistrationToggle={toggleInterestGroupEventRegistration}
    />
  )
}
