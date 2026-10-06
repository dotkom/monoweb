import { getServerSession } from "@/auth"
import { server } from "@/utils/trpc/server"
import { GroupTypeSchema } from "@dotkomonline/rpc/group"
import { getFutureSidequestsQuery, getSidequestListNow, getPastSidequestsQuery } from "./sidequest-list-query"
import { SidequestListPage } from "./SidequestListPage"

export default async function Page() {
  const now = getSidequestListNow()
  const session = await getServerSession()

  const [interestGroups, currentUserGroupMemberships, futureSidequests, firstPageOfPastSidequests] = await Promise.all([
    server.group.allByType.query(GroupTypeSchema.enum.INTEREST_GROUP),
    session !== null ? server.group.allMembershipsByUserId.query(session.sub) : Promise.resolve([]),
    server.sidequest.findMany.query(getFutureSidequestsQuery(now)),
    server.sidequest.findMany.query(getPastSidequestsQuery(now)),
  ])

  return (
    <SidequestListPage
      now={now}
      isLoggedIn={session !== null}
      interestGroups={interestGroups}
      currentUserGroupMemberships={currentUserGroupMemberships}
      firstPageOfFutureSidequests={futureSidequests}
      firstPageOfPastSidequests={firstPageOfPastSidequests}
    />
  )
}
