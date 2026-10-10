"use client"

import { LoadMoreSentinel } from "@/components/molecules/LoadMoreSentinel/LoadMoreSentinel"
import { getActiveMembershipsForGroup, hasNonDefaultGroupRole, type GroupMembership } from "@dotkomonline/rpc/group"
import type { SidequestSummary } from "@dotkomonline/rpc/sidequest"
import { Text } from "@dotkomonline/ui"
import { IconMoodConfuzed } from "@tabler/icons-react"
import { SidequestCard, SidequestCardSkeleton } from "./SidequestCard"

interface Props {
  futureSidequests: SidequestSummary[]
  pastSidequests: SidequestSummary[]
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
  onRegistrationToggle: (sidequest: SidequestSummary) => void
}

export const SidequestList = ({
  futureSidequests,
  pastSidequests,
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
  const showInitialSkeleton = isLoading && futureSidequests.length === 0 && pastSidequests.length === 0

  if (showInitialSkeleton) {
    return <SidequestListSkeleton />
  }

  if (futureSidequests.length === 0 && pastSidequests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 p-4">
        <IconMoodConfuzed className="h-10 w-10 text-gray-500 dark:text-stone-500" />
        <Text className="text-gray-500 dark:text-stone-500">Det er ingen Sidequests å vise...</Text>
      </div>
    )
  }

  return (
    <div
      className="flex w-full flex-col gap-8"
      aria-busy={isFetchingNextFuturePage || isFetchingNextPastPage || isLoading}
    >
      {(futureSidequests.length > 0 || isFetchingNextFuturePage) && (
        <div>
          <div className="flex flex-col gap-2">
            {futureSidequests.map((sidequest) => (
              <WrappedSidequestCard
                key={sidequest.id}
                sidequest={sidequest}
                currentUserGroupMemberships={currentUserGroupMemberships}
                isLoggedIn={isLoggedIn}
                onRegistrationToggle={onRegistrationToggle}
              />
            ))}

            {isFetchingNextFuturePage && <SidequestListSkeleton />}
          </div>

          <LoadMoreSentinel
            fetchNextPage={fetchNextFuturePage}
            hasNextPage={hasNextFuturePage}
            isFetchingNextPage={isFetchingNextFuturePage}
            isPlaceholderData={isPlaceholderData}
            isLoading={isLoading}
          />
        </div>
      )}

      {(pastSidequests.length > 0 || isFetchingNextPastPage) && (
        <div>
          <div className="flex flex-col gap-2">
            {pastSidequests.length > 0 && (
              <div className="flex w-full min-w-0 flex-row items-center gap-2">
                <span className="h-0.5 grow rounded-full bg-gray-200 dark:bg-stone-700" />
                <Text className="shrink-0 text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-stone-600">
                  Tidligere Sidequests
                </Text>
                <span className="h-0.5 grow rounded-full bg-gray-200 dark:bg-stone-700" />
              </div>
            )}

            {pastSidequests.map((sidequest) => (
              <WrappedSidequestCard
                key={sidequest.id}
                sidequest={sidequest}
                currentUserGroupMemberships={currentUserGroupMemberships}
                isLoggedIn={isLoggedIn}
                onRegistrationToggle={onRegistrationToggle}
              />
            ))}

            {isFetchingNextPastPage && <SidequestListSkeleton />}
          </div>

          <LoadMoreSentinel
            fetchNextPage={fetchNextPastPage}
            hasNextPage={hasNextPastPage}
            isFetchingNextPage={isFetchingNextPastPage}
            isPlaceholderData={isPlaceholderData}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  )
}

interface WrappedSidequestCardProps {
  sidequest: SidequestSummary
  currentUserGroupMemberships: GroupMembership[]
  isLoggedIn: boolean
  onRegistrationToggle: (sidequest: SidequestSummary) => void
}

const WrappedSidequestCard = ({
  sidequest,
  currentUserGroupMemberships,
  isLoggedIn,
  onRegistrationToggle,
}: WrappedSidequestCardProps) => {
  const activeMemberships = getActiveMembershipsForGroup(currentUserGroupMemberships, sidequest.interestGroup.slug)
  const hasNonDefaultRole = activeMemberships.some((membership) =>
    hasNonDefaultGroupRole(membership, sidequest.interestGroup)
  )
  const isActiveMember = activeMemberships.length > 0

  return (
    <SidequestCard
      sidequest={sidequest}
      isCurrentUserMemberOfInterestGroup={isActiveMember}
      hasNonDefaultRole={hasNonDefaultRole}
      isLoggedIn={isLoggedIn}
      onRegistrationToggle={onRegistrationToggle}
    />
  )
}

const SidequestListSkeleton = () => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: 5 }, (_, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: index is fine for non-reordering skeleton list
      <SidequestCardSkeleton key={i} />
    ))}
  </div>
)
