"use client"

import OnlineIcon from "@/components/atoms/OnlineIcon"
import { trpc } from "@/utils/trpc/client"
import type { InterestGroup, InterestGroupId, InterestGroupMember, User } from "@dotkomonline/types"
import { Button } from "@dotkomonline/ui"
import type { Session } from "next-auth"
import Link from "next/link"
import type { FC } from "react"
import SkeletonInterestGroupView from "./SkeletonInterestGroupView"

interface InterestGroupViewProps {
  sessionUser?: Session["user"]
  interestGroupId: InterestGroupId
}

export const InterestGroupView: FC<InterestGroupViewProps> = (props: InterestGroupViewProps) => {
  const { sessionUser, interestGroupId } = props

  const userQuery = trpc.user.getMe.useQuery(undefined, {
    enabled: Boolean(sessionUser),
  })

  const interestGroupQuery = trpc.interestGroup.get.useQuery(interestGroupId)
  const membersQuery = trpc.interestGroup.getMembers.useQuery(interestGroupId)

  const interestGroup = interestGroupQuery.data
  const members = membersQuery.data

  const isLoading = (userQuery.isLoading && sessionUser) || interestGroupQuery.isLoading || membersQuery.isLoading
  const isError = !interestGroup || !members

  return isLoading ? (
    <SkeletonInterestGroupView />
  ) : isError ? (
    <p>Not found</p>
  ) : (
    <InterestGroupViewInner
      interestGroup={interestGroup}
      user={userQuery.data ?? undefined}
      members={members}
      refetchMembers={membersQuery.refetch}
    />
  )
}

interface InnerInterestGroupViewProps {
  interestGroup: InterestGroup
  members: InterestGroupMember[]
  user: User | undefined
  refetchMembers: () => void
}

const InterestGroupViewInner: FC<InnerInterestGroupViewProps> = (props: InnerInterestGroupViewProps) => {
  const { interestGroup, members, user, refetchMembers } = props

  const isInGroup = user && members.some((member) => member.userId === user.id)

  const addMember = trpc.interestGroup.addMember.useMutation({
    onSuccess: () => {
      refetchMembers()
    },
    onError: (error) => {
      console.error("Failed to join:", error.message)
    },
  })

  const removeMember = trpc.interestGroup.removeMember.useMutation({
    onSuccess: () => {
      refetchMembers()
    },
    onError: (error) => {
      console.error("Failed to leave:", error.message)
    },
  })

  const joinInterestGroup = () => {
    if (user) {
      addMember.mutate({ interestGroupId: interestGroup.id, userId: user.id })
    }
  }

  const leaveInterestGroup = () => {
    if (user) {
      removeMember.mutate({ interestGroupId: interestGroup.id, userId: user.id })
    }
  }

  return (
    <div className="p-14 my-16 mx-auto border-slate-3 rounded-lg border shadow-md w-10/12 ">
      <Link className="bg-transparent p-0 hover:underline mb-4" href={"/interest-groups"}>
        {"<"} Tilbake
      </Link>
      <div className="flex md:flex-row flex-col-reverse">
        <div className="mr-4">
          <h2 className="text-lg border-none !mt-4">{interestGroup.name}</h2>
          <p className="mt-2">
            {interestGroup.longDescription ? interestGroup.longDescription : interestGroup.description}
          </p>
          {interestGroup.joinInfo && (
            <section className="mt-10">
              <h3 className="text-lg border-none">Kontakt</h3>
              {interestGroup.joinInfo}
            </section>
          )}
          {interestGroup.link && (
            <Link className="hover:underline text-blue-10 block mt-4" href={interestGroup.link}>
              Gå til wikisiden her
            </Link>
          )}
          <div className="mt-8">
            {isInGroup ? (
              <Button onClick={leaveInterestGroup} disabled={addMember.isLoading || !user}>
                Leave
              </Button>
            ) : (
              <Button onClick={joinInterestGroup} disabled={addMember.isLoading || !user}>
                Join
              </Button>
            )}
          </div>
          <section>
            <h2>Members</h2>
            {members.length > 0 ? (
              <ul>
                {members.map((member) => (
                  <li key={member.userId}>{member.userId}</li>
                ))}
              </ul>
            ) : (
              <p>No members</p>
            )}
          </section>
        </div>
        <OnlineIcon className="max-w-[200px] min-w-[200px] py-auto ml-auto sm:mb-auto mb-9 mt-2" />
      </div>
    </div>
  )
}

export default InterestGroupView
