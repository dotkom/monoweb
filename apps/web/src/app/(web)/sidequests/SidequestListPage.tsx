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
import { isUserRegisteredForSidequest, type SidequestSummary } from "@dotkomonline/rpc/sidequest"
import { Text, TextLink, Title } from "@dotkomonline/ui"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { InterestGroupList } from "./components/InterestGroupList"
import { SidequestDrawer } from "./components/SidequestDrawer"
import { SidequestList } from "./components/SidequestList"
import { SidequestToolbar } from "./components/SidequestToolbar"
import { useRegisterForSidequest, useUnregisterFromSidequest } from "./mutations"
import {
  useCurrentUserGroupMembershipsQuery,
  useInterestGroupsQuery,
  useSidequestByIdQuery,
  useSidequestsInfiniteQuery,
  type SidequestFindManyPage,
} from "./queries"
import { getFutureSidequestsQuery, getPastSidequestsQuery } from "./sidequest-list-query"
import { useToggleInterestGroupMembership } from "./use-toggle-interest-group-membership"

interface Props {
  now: TZDate
  isLoggedIn: boolean
  interestGroups: Group[]
  currentUserGroupMemberships: GroupMembership[]
  firstPageOfFutureSidequests: SidequestFindManyPage
  firstPageOfPastSidequests: SidequestFindManyPage
}

export const SidequestListPage = ({
  now,
  isLoggedIn: initialIsLoggedIn,
  interestGroups: initialInterestGroups,
  currentUserGroupMemberships: initialCurrentUserGroupMemberships,
  firstPageOfFutureSidequests,
  firstPageOfPastSidequests,
}: Props) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const userId = user?.sub
  const isLoggedIn = initialIsLoggedIn || userId !== undefined

  const selectedSidequestId = searchParams.get("id")

  const [selectedInterestGroup, setSelectedInterestGroup] = useState<Group | null>(null)
  const [isEventDrawerClosing, setIsEventDrawerClosing] = useState(false)

  const registerForSidequestMutation = useRegisterForSidequest()
  const unregisterFromSidequestMutation = useUnregisterFromSidequest()

  const isUnfiltered = selectedInterestGroup === null
  const groupFilter = selectedInterestGroup !== null ? [selectedInterestGroup.slug] : undefined

  const { interestGroups } = useInterestGroupsQuery(initialInterestGroups)
  const { memberships: currentUserGroupMemberships } = useCurrentUserGroupMembershipsQuery(
    userId,
    initialCurrentUserGroupMemberships
  )

  const toggleInterestGroupMembership = useToggleInterestGroupMembership(currentUserGroupMemberships)

  const currentUserInterestGroups = interestGroups.filter(
    (group) => getActiveMembershipsForGroup(currentUserGroupMemberships, group.slug).length > 0
  )

  const sortedInterestGroups = interestGroups.toSorted(compareInterestGroupsByDisplayName)

  const sortedCurrentUserInterestGroups = currentUserInterestGroups.toSorted((leftGroup, rightGroup) => {
    const leftCanEndMembership = canEndInterestGroupMemberships(currentUserGroupMemberships, leftGroup)
    const rightCanEndMembership = canEndInterestGroupMemberships(currentUserGroupMemberships, rightGroup)

    if (leftCanEndMembership !== rightCanEndMembership) {
      if (leftCanEndMembership) {
        return 1
      }

      return -1
    }

    return compareInterestGroupsByDisplayName(leftGroup, rightGroup)
  })

  const {
    sidequests: futureSidequests,
    fetchNextPage: fetchNextFuturePage,
    hasNextPage: hasNextFuturePage,
    isFetchingNextPage: isFetchingNextFuturePage,
    isPlaceholderData: isFuturePlaceholderData,
    isLoading: isFutureLoading,
  } = useSidequestsInfiniteQuery(
    getFutureSidequestsQuery(now, groupFilter),
    isUnfiltered ? firstPageOfFutureSidequests : undefined
  )

  const {
    sidequests: pastSidequests,
    fetchNextPage: fetchNextPastPage,
    hasNextPage: hasNextPastPage,
    isFetchingNextPage: isFetchingNextPastPage,
    isPlaceholderData: isPastPlaceholderData,
    isLoading: isPastLoading,
  } = useSidequestsInfiniteQuery(
    getPastSidequestsQuery(now, groupFilter),
    isUnfiltered ? firstPageOfPastSidequests : undefined
  )

  const { data: fetchedSidequest } = useSidequestByIdQuery(selectedSidequestId)
  const [displayedSidequest, setDisplayedSidequest] = useState<SidequestSummary | null>(null)

  useEffect(() => {
    if (fetchedSidequest !== undefined && fetchedSidequest !== null) {
      setDisplayedSidequest(fetchedSidequest)
    }
  }, [fetchedSidequest])

  const isEventDrawerOpen =
    selectedSidequestId !== null &&
    !isEventDrawerClosing &&
    displayedSidequest !== null &&
    displayedSidequest.id === selectedSidequestId

  useEffect(() => {
    if (selectedSidequestId === null) {
      setIsEventDrawerClosing(false)
    }
  }, [selectedSidequestId])

  const removeEventSearchParam = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("id")
    params.delete("sidequest")

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

  const onMembershipToggle = (interestGroupId: string) => {
    const interestGroup = interestGroups.find((group) => group.slug === interestGroupId)
    if (interestGroup === undefined) {
      return
    }

    toggleInterestGroupMembership(interestGroup)
  }

  const toggleSelect = (interestGroup: Group | null) => {
    if (interestGroup === null || selectedInterestGroup?.slug === interestGroup.slug) {
      setSelectedInterestGroup(null)
    } else {
      setSelectedInterestGroup(interestGroup)
    }
  }

  const toggleSidequestRegistration = (sidequest: SidequestSummary) => {
    if (userId === undefined) {
      return
    }

    if (isUserRegisteredForSidequest(userId, sidequest)) {
      unregisterFromSidequestMutation.mutate(sidequest.id)
    } else {
      registerForSidequestMutation.mutate(sidequest.id)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <Title element="h1" size="xl">
          Sidequests
        </Title>
        <div className="flex flex-col gap-1 text-muted-foreground">
          <Text>Finn lavterskel Sidequests, møt folk med samme interesser og bli med når det passer.</Text>
          <TextLink href="/interessegrupper" className="text-sm w-fit">
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
            onMembershipToggle={onMembershipToggle}
            isLoggedIn={isLoggedIn}
          />
        </aside>

        <main className="flex flex-col gap-2 w-full min-w-0 max-w-3xl">
          <SidequestToolbar
            interestGroups={sortedInterestGroups}
            currentUserInterestGroups={sortedCurrentUserInterestGroups}
            currentUserGroupMemberships={currentUserGroupMemberships}
            selectedInterestGroup={selectedInterestGroup}
            onSelectInterestGroup={toggleSelect}
            onMembershipToggle={onMembershipToggle}
            isLoggedIn={isLoggedIn}
          />

          <SidequestList
            futureSidequests={futureSidequests}
            pastSidequests={pastSidequests}
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
            onRegistrationToggle={toggleSidequestRegistration}
          />
        </main>
      </div>

      <SidequestDrawer
        sidequest={displayedSidequest}
        isOpen={isEventDrawerOpen}
        onOpenChange={handleEventDrawerOpenChange}
        onCloseComplete={() => {
          setDisplayedSidequest(null)
        }}
        userId={userId ?? null}
        isLoggedIn={isLoggedIn}
        onRegistrationClick={() => {
          if (displayedSidequest !== null) {
            toggleSidequestRegistration(displayedSidequest)
          }
        }}
      />
    </div>
  )
}

function compareInterestGroupsByDisplayName(leftGroup: Group, rightGroup: Group) {
  return getGroupDisplayName(leftGroup).localeCompare(getGroupDisplayName(rightGroup), "nb")
}
