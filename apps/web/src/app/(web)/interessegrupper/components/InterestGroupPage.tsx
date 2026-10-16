"use client"

import { useTRPC } from "@/utils/trpc/client"
import {
  type Group,
  type GroupMember,
  GroupRoleTypeEnum,
  type InterestGroupComment,
  findActiveGroupMembership,
  getGroupDisplayName,
  getInterestGroupAdminUrl,
  hasGroupMembershipRoleType,
  isGroupMemberActive,
  isGroupMemberVisible,
  sortGroupMembersByRoleThenSeniority,
} from "@dotkomonline/rpc/group"
import { type SidequestSummary, isUserRegisteredForSidequest } from "@dotkomonline/rpc/sidequest"
import type { UserId } from "@dotkomonline/rpc/user"
import { Title } from "@dotkomonline/ui"
import { useQueries } from "@tanstack/react-query"
import { getGroupEasterEgg } from "../../grupper/components/easter-eggs"
import { GroupPageHeader } from "../../grupper/components/GroupPageHeader"
import { WanderingMascot } from "../../grupper/components/WanderingMascot"
import { SidequestList } from "../../sidequests/components/SidequestList"
import { useRegisterForSidequest, useUnregisterFromSidequest } from "../../sidequests/mutations"
import { useSidequestsInfiniteQuery } from "../../sidequests/queries"
import {
  getFutureSidequestsQuery,
  getPastSidequestsQuery,
  getSidequestListNow,
} from "../../sidequests/sidequest-list-query"
import { InterestGroupCommentSection } from "../[slug]/components/InterestGroupCommentSection"
import { useInterestGroupView } from "../use-interest-group-view"
import { InterestGroupMembers } from "./InterestGroupMembers"

interface Props {
  interestGroup: Group
  userId?: UserId
  initialMembers: Map<UserId, GroupMember>
  initialComments: InterestGroupComment[]
}

export const InterestGroupPage = ({ interestGroup, userId, initialMembers, initialComments }: Props) => {
  const trpc = useTRPC()
  const now = getSidequestListNow()
  const canSeeMembers = interestGroup.memberVisibility !== "NONE"

  const [{ data: members }, { data: comments }] = useQueries({
    queries: [
      {
        ...trpc.group.getMembers.queryOptions(interestGroup.slug),
        initialData: initialMembers,
      },
      {
        ...trpc.group.findManyInterestGroupComments.queryOptions(interestGroup.slug),
        initialData: initialComments,
        enabled: userId !== undefined,
      },
    ],
  })

  const view = useInterestGroupView({ interestGroup, groupMembers: members, initialUserId: userId })

  const futureSidequestsQuery = useSidequestsInfiniteQuery(
    getFutureSidequestsQuery(now, [interestGroup.slug]),
    undefined
  )
  const pastSidequestsQuery = useSidequestsInfiniteQuery(getPastSidequestsQuery(now, [interestGroup.slug]), undefined)

  const registerForSidequestMutation = useRegisterForSidequest()
  const unregisterFromSidequestMutation = useUnregisterFromSidequest()

  const toggleSidequestRegistration = (sidequest: SidequestSummary) => {
    if (view.userId === undefined) {
      return
    }

    if (isUserRegisteredForSidequest(view.userId, sidequest)) {
      unregisterFromSidequestMutation.mutate(sidequest.id)
    } else {
      registerForSidequestMutation.mutate(sidequest.id)
    }
  }

  const handleToggleMembership = () => {
    view.toggleMembership(interestGroup)
  }

  const membersToShow = [...members.values()].filter((member) =>
    isGroupMemberVisible(member, interestGroup.memberVisibility, view.userId)
  )

  const activeMembers = sortGroupMembersByRoleThenSeniority(
    [...membersToShow].filter((member) => isGroupMemberActive(member))
  )

  const leader = [...members.values()].find((member) => {
    const membership = findActiveGroupMembership(member)
    if (membership === null) {
      return false
    }

    return hasGroupMembershipRoleType(membership, GroupRoleTypeEnum.LEADER)
  })

  const easterEgg = getGroupEasterEgg(getGroupDisplayName(interestGroup))

  return (
    <div className="flex flex-col gap-8">
      <GroupPageHeader
        group={interestGroup}
        leader={leader}
        manageGroupUrl={view.isLeader ? getInterestGroupAdminUrl(interestGroup.slug) : undefined}
      />

      {canSeeMembers && (
        <InterestGroupMembers
          members={activeMembers}
          currentUserId={view.userId}
          isMember={view.isMember}
          canLeave={view.canLeave}
          onToggleMembership={handleToggleMembership}
        />
      )}

      <InterestGroupCommentSection
        interestGroup={interestGroup}
        comments={comments}
        user={view.user}
        isMember={view.isMember}
        onJoin={handleToggleMembership}
      />

      <div className="flex flex-col gap-2">
        <Title>Sidequests</Title>
        <SidequestList
          futureSidequests={futureSidequestsQuery.sidequests}
          pastSidequests={pastSidequestsQuery.sidequests}
          currentUserGroupMemberships={view.memberships}
          fetchNextFuturePage={futureSidequestsQuery.fetchNextPage}
          isFetchingNextFuturePage={futureSidequestsQuery.isFetchingNextPage}
          hasNextFuturePage={futureSidequestsQuery.hasNextPage}
          fetchNextPastPage={pastSidequestsQuery.fetchNextPage}
          isFetchingNextPastPage={pastSidequestsQuery.isFetchingNextPage}
          hasNextPastPage={pastSidequestsQuery.hasNextPage}
          isPlaceholderData={futureSidequestsQuery.isPlaceholderData || pastSidequestsQuery.isPlaceholderData}
          isLoading={futureSidequestsQuery.isLoading || pastSidequestsQuery.isLoading}
          isLoggedIn={view.isLoggedIn}
          onRegistrationToggle={toggleSidequestRegistration}
        />
      </div>

      {easterEgg?.mascot !== undefined && <WanderingMascot config={easterEgg.mascot} />}
    </div>
  )
}
