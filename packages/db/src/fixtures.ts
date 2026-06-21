import { createPrisma } from "./index"
import { buildAttendancePoolMap, getAttendeeFixtures } from "./fixtures/attendee"
import { getAttendanceFixtures } from "./fixtures/attendance"
import { getPoolFixtures } from "./fixtures/attendance-pool"
import { getCompanyFixtures } from "./fixtures/company"
import { getEventFixtures } from "./fixtures/event"
import { getEventHostingGroupFixtures } from "./fixtures/event-hosting-group"
import { getGroupFixtures, getGroupRoleFixtures } from "./fixtures/group"
import { getJobListingFixtures, getJobListingLocationFixtures } from "./fixtures/job-listing"
import { getMarkFixtures } from "./fixtures/mark"
import { getMembershipFixtures } from "./fixtures/membership"
import { getOfflineFixtures } from "./fixtures/offline"
import { getUserFixtures } from "./fixtures/user"
import { getGroupMembershipFixtures } from "./fixtures/group-membership"
import { getGroupMembershipRoleFixtures } from "./fixtures/group-membership-role"
import { FADDERUKE_CONTEST_ID, getContestFixture, getContestTeamFixtures } from "./fixtures/contest"
import { FADDERUKE_EVENT_ID } from "./fixtures/event"
import { getFadderukeFixture } from "./fixtures/fadderuke"

if (process.env.DATABASE_URL === undefined) {
  throw new Error("Missing database url")
}

if (process.env.DATABASE_URL.includes("prod")) {
  throw new Error("Tried adding fixtures to a production database")
}

const db = createPrisma(process.env.DATABASE_URL)

// The ordering of things is *somewhat* important here, as some things depend on others. Developers modifying or adding
// entires to this file should consider what makes sense for a user of the app to make first.

const userInput = getUserFixtures()
const userIds = userInput.map((u) => u.id)
await db.user.createManyAndReturn({ data: userInput })
const membershipInput = getMembershipFixtures(userIds)
await db.membership.createManyAndReturn({ data: membershipInput })

const companyInput = getCompanyFixtures()
const companies = await db.company.createManyAndReturn({ data: companyInput })

const groupInput = getGroupFixtures()
await db.group.createManyAndReturn({ data: groupInput })
const groupRoleInput = groupInput.flatMap(getGroupRoleFixtures)
await db.groupRole.createManyAndReturn({ data: groupRoleInput })
const groupRoleIds = new Map(
  (await db.groupRole.findMany({ select: { id: true, groupId: true, type: true } })).map(
    (role) => [`${role.groupId}:${role.type}`, role.id] as const
  )
)

const groupMembershipInput = getGroupMembershipFixtures(userIds)
await db.groupMembership.createManyAndReturn({ data: groupMembershipInput })
const groupMembershipRoleInput = getGroupMembershipRoleFixtures(groupRoleIds)
await db.groupMembershipRole.createMany({ data: groupMembershipRoleInput })

const attendanceInput = getAttendanceFixtures()
const attendances = await db.attendance.createManyAndReturn({ data: attendanceInput })
const eventInput = getEventFixtures(attendances.map((a) => a.id))
const events = await db.event.createManyAndReturn({ data: eventInput })
const attendanceIds = attendances.map((attendance) => attendance.id)
const attendancePoolInput = getPoolFixtures(attendanceIds)
const attendancePools = await db.attendancePool.createManyAndReturn({ data: attendancePoolInput })
const attendancePoolMap = buildAttendancePoolMap(attendancePools)
const attendeeInput = getAttendeeFixtures(attendancePoolMap, attendanceIds, userIds)
await db.attendee.createMany({ data: attendeeInput })
const eventHostingGroupInput = getEventHostingGroupFixtures(events.map((e) => e.id))
await db.eventHostingGroup.createManyAndReturn({ data: eventHostingGroupInput })

const markInput = getMarkFixtures()
await db.mark.createManyAndReturn({ data: markInput })

const jobListingInput = getJobListingFixtures(companies.map((company) => company.id))
const jobListings = await db.jobListing.createManyAndReturn({ data: jobListingInput })
const jobListingLocationInput = getJobListingLocationFixtures(jobListings.map((jobListing) => jobListing.id))
await db.jobListingLocation.createManyAndReturn({ data: jobListingLocationInput })

await db.contest.create({ data: getContestFixture() })
const contestTeamFixtures = getContestTeamFixtures(userIds)
await db.contestant.createMany({ data: contestTeamFixtures.map((fixture) => fixture.contestant) })
for (const { team } of contestTeamFixtures) {
  await db.contestTeam.create({
    data: {
      id: team.id,
      name: team.name,
      contestantId: team.contestantId,
      members: {
        connect: team.memberUserIds.map((memberUserId) => ({ id: memberUserId })),
      },
    },
  })
}
await db.contest.update({
  where: { id: FADDERUKE_CONTEST_ID },
  data: { winnerContestantId: contestTeamFixtures[0].contestant.id },
})

await db.event.update({
  where: { id: FADDERUKE_EVENT_ID },
  data: { contestId: FADDERUKE_CONTEST_ID },
})
await db.fadderuke.create({ data: getFadderukeFixture() })

const offlineInput = getOfflineFixtures()
await db.offline.createMany({ data: offlineInput })
