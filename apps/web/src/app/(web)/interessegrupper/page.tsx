import { getServerSession } from "@/auth"
import { server } from "@/utils/trpc/server"
import {
  getFutureInterestGroupEventsQuery,
  getInterestGroupEventListNow,
  getPastInterestGroupEventsQuery,
} from "./interest-group-event-list-query"
import { InterestGroupEventListPage } from "./InterestGroupEventListPage"

export default async function Page() {
  const now = getInterestGroupEventListNow()
  const session = await getServerSession()

  const [interestGroups, currentUserGroupMemberships, futureInterestGroupEvents, firstPageOfPastInterestGroupEvents] =
    await Promise.all([
      server.group.allByType.query("INTEREST_GROUP"),
      session !== null ? server.group.allMembershipsByUserId.query(session.sub) : Promise.resolve([]),
      server.interestGroupEvent.findMany.query(getFutureInterestGroupEventsQuery(now)),
      server.interestGroupEvent.findMany.query(getPastInterestGroupEventsQuery(now)),
    ])

  return (
    <InterestGroupEventListPage
      now={now}
      isLoggedIn={session !== null}
      interestGroups={interestGroups}
      currentUserGroupMemberships={currentUserGroupMemberships}
      futureInterestGroupEvents={futureInterestGroupEvents}
      firstPageOfPastInterestGroupEvents={firstPageOfPastInterestGroupEvents}
    />
  )
}
