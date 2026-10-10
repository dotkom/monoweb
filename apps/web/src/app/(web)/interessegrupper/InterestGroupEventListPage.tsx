"use client"

import { useUser } from "@auth0/nextjs-auth0"
import type { TZDate } from "@date-fns/tz"
import {
  canEndInterestGroupMemberships,
  getActiveMembershipsForGroup,
  getGroupDisplayName,
  type Group,
  type GroupMembership,
} from "@dotkomonline/rpc/group"
import {
  isUserRegisteredForInterestGroupEvent,
  type InterestGroupEventSummary,
} from "@dotkomonline/rpc/interest-group-event"
import { Text, TextLink, Title } from "@dotkomonline/ui"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { InterestGroupEventDrawer } from "./components/InterestGroupEventDrawer"
import { InterestGroupEventList } from "./components/InterestGroupEventList"
import { InterestGroupEventToolbar } from "./components/InterestGroupEventToolbar"
import { InterestGroupList } from "./components/InterestGroupList"
import { getFutureInterestGroupEventsQuery, getPastInterestGroupEventsQuery } from "./interest-group-event-list-query"
import {
  useEndInterestGroupMembershipMutation,
  useRegisterForInterestGroupEvent,
  useStartInterestGroupMembershipMutation,
  useUnregisterFromInterestGroupEvent,
} from "./mutations"
import {
  useCurrentUserGroupMembershipsQuery,
  useInterestGroupEventByIdQuery,
  useInterestGroupEventsInfiniteQuery,
  useInterestGroupsQuery,
  type InterestGroupEventFindManyPage,
} from "./queries"

interface Props {
  now: TZDate
  isLoggedIn: boolean
  interestGroups: Group[]
  currentUserGroupMemberships: GroupMembership[]
  futureInterestGroupEvents: InterestGroupEventFindManyPage
  firstPageOfPastInterestGroupEvents: InterestGroupEventFindManyPage
}

export const InterestGroupEventListPage = ({
  now,
  isLoggedIn: initialIsLoggedIn,
  interestGroups: initialInterestGroups,
  currentUserGroupMemberships: initialCurrentUserGroupMemberships,
  futureInterestGroupEvents: initialFutureInterestGroupEvents,
  firstPageOfPastInterestGroupEvents,
}: Props) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const userId = user?.sub
  const isLoggedIn = initialIsLoggedIn || userId !== undefined

  const selectedInterestGroupEventId = searchParams.get("id")

  const [selectedInterestGroup, setSelectedInterestGroup] = useState<Group | null>(null)
  const [isEventDrawerClosing, setIsEventDrawerClosing] = useState(false)

  const startInterestGroupMembershipMutation = useStartInterestGroupMembershipMutation()
  const endInterestGroupMembershipMutation = useEndInterestGroupMembershipMutation()
  const registerForInterestGroupEventMutation = useRegisterForInterestGroupEvent()
  const unregisterFromInterestGroupEventMutation = useUnregisterFromInterestGroupEvent()

  const isUnfiltered = selectedInterestGroup === null
  const groupFilter = selectedInterestGroup !== null ? [selectedInterestGroup.slug] : undefined

  const { interestGroups } = useInterestGroupsQuery(initialInterestGroups)
  const { memberships: currentUserGroupMemberships } = useCurrentUserGroupMembershipsQuery(
    userId,
    initialCurrentUserGroupMemberships
  )

  const currentUserInterestGroups = interestGroups.filter(
    (group) => getActiveMembershipsForGroup(currentUserGroupMemberships, group.slug).length > 0
  )

  const sortedInterestGroups = interestGroups.toSorted(compareInterestGroupsByDisplayName)

  const sortedCurrentUserInterestGroups = currentUserInterestGroups.toSorted((leftGroup, rightGroup) => {
    const leftCanEndMembership = canEndInterestGroupMemberships(currentUserGroupMemberships, leftGroup.slug)
    const rightCanEndMembership = canEndInterestGroupMemberships(currentUserGroupMemberships, rightGroup.slug)

    if (leftCanEndMembership !== rightCanEndMembership) {
      if (leftCanEndMembership) {
        return 1
      }

      return -1
    }

    return compareInterestGroupsByDisplayName(leftGroup, rightGroup)
  })

  const {
    interestGroupEvents: futureInterestGroupEvents,
    fetchNextPage: fetchNextFuturePage,
    hasNextPage: hasNextFuturePage,
    isFetchingNextPage: isFetchingNextFuturePage,
    isPlaceholderData: isFuturePlaceholderData,
    isLoading: isFutureLoading,
  } = useInterestGroupEventsInfiniteQuery(
    getFutureInterestGroupEventsQuery(now, groupFilter),
    isUnfiltered ? initialFutureInterestGroupEvents : undefined
  )

  const {
    interestGroupEvents: pastInterestGroupEvents,
    fetchNextPage: fetchNextPastPage,
    hasNextPage: hasNextPastPage,
    isFetchingNextPage: isFetchingNextPastPage,
    isPlaceholderData: isPastPlaceholderData,
    isLoading: isPastLoading,
  } = useInterestGroupEventsInfiniteQuery(
    getPastInterestGroupEventsQuery(now, groupFilter),
    isUnfiltered ? firstPageOfPastInterestGroupEvents : undefined
  )

  const { data: fetchedInterestGroupEvent } = useInterestGroupEventByIdQuery(selectedInterestGroupEventId)
  const [displayedInterestGroupEvent, setDisplayedInterestGroupEvent] = useState<InterestGroupEventSummary | null>(null)

  useEffect(() => {
    if (fetchedInterestGroupEvent !== undefined && fetchedInterestGroupEvent !== null) {
      setDisplayedInterestGroupEvent(fetchedInterestGroupEvent)
    }
  }, [fetchedInterestGroupEvent])

  const isEventDrawerOpen =
    selectedInterestGroupEventId !== null &&
    !isEventDrawerClosing &&
    displayedInterestGroupEvent !== null &&
    displayedInterestGroupEvent.id === selectedInterestGroupEventId

  useEffect(() => {
    if (selectedInterestGroupEventId === null) {
      setIsEventDrawerClosing(false)
    }
  }, [selectedInterestGroupEventId])

  const removeEventSearchParam = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("id")
    params.delete("arrangement")

    const query = params.toString()
    const url = query.length > 0 ? `${pathname}?${query}` : pathname

    window.history.replaceState(null, "", url)
  }

  const handleEventDrawerOpenChange = (open: boolean) => {
    if (open) {
      return
    }

    setIsEventDrawerClosing(true)
    removeEventSearchParam()
  }

  const toggleInterestGroupMembership = (interestGroupId: string) => {
    const isMember = sortedCurrentUserInterestGroups.some((interestGroup) => interestGroup.slug === interestGroupId)
    if (!isMember) {
      startInterestGroupMembershipMutation.mutate(interestGroupId)

      return
    }

    const canEndMembership = canEndInterestGroupMemberships(currentUserGroupMemberships, interestGroupId)
    if (!canEndMembership) {
      return
    }

    endInterestGroupMembershipMutation.mutate(interestGroupId)
  }

  const toggleSelect = (interestGroup: Group | null) => {
    if (interestGroup === null || selectedInterestGroup?.slug === interestGroup.slug) {
      setSelectedInterestGroup(null)
    } else {
      setSelectedInterestGroup(interestGroup)
    }
  }

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

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Title element="h1" size="xl">
          Interessegrupper
        </Title>
        <div className="flex flex-col gap-1 text-muted-foreground">
          <Text>Finn lavterskel arrangementer, møt folk med samme interesser og bli med når det passer.</Text>
          <TextLink href="/interessegrupper/grupper" className="text-sm w-fit">
            Se alle interessegrupper
          </TextLink>
        </div>
      </header>

      <div className="flex items-start gap-8">
        <aside className="sticky top-28 hidden h-fit max-h-[calc(100dvh-8rem)] w-64 shrink-0 overflow-y-auto pr-1 lg:block">
          <InterestGroupList
            interestGroups={sortedInterestGroups}
            currentUserInterestGroups={sortedCurrentUserInterestGroups}
            currentUserGroupMemberships={currentUserGroupMemberships}
            selectedInterestGroup={selectedInterestGroup}
            onSelectInterestGroup={toggleSelect}
            onMembershipToggle={toggleInterestGroupMembership}
            isLoggedIn={isLoggedIn}
          />
        </aside>

        <main className="flex flex-col gap-2 w-full min-w-0 max-w-3xl">
          <InterestGroupEventToolbar
            interestGroups={sortedInterestGroups}
            currentUserInterestGroups={sortedCurrentUserInterestGroups}
            currentUserGroupMemberships={currentUserGroupMemberships}
            selectedInterestGroup={selectedInterestGroup}
            onSelectInterestGroup={toggleSelect}
            onMembershipToggle={toggleInterestGroupMembership}
            isLoggedIn={isLoggedIn}
          />

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
            isLoggedIn={isLoggedIn}
            onRegistrationToggle={toggleInterestGroupEventRegistration}
          />
        </main>
      </div>

      <InterestGroupEventDrawer
        interestGroupEvent={displayedInterestGroupEvent}
        isOpen={isEventDrawerOpen}
        onOpenChange={handleEventDrawerOpenChange}
        onCloseComplete={() => {
          setDisplayedInterestGroupEvent(null)
        }}
        userId={userId ?? null}
        isLoggedIn={isLoggedIn}
        onRegistrationClick={() => {
          if (displayedInterestGroupEvent !== null) {
            toggleInterestGroupEventRegistration(displayedInterestGroupEvent)
          }
        }}
      />
    </div>
  )
}

function compareInterestGroupsByDisplayName(leftGroup: Group, rightGroup: Group) {
  return getGroupDisplayName(leftGroup).localeCompare(getGroupDisplayName(rightGroup), "nb")
}
