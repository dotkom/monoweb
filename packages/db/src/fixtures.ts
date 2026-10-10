import { compareAsc, isFuture } from "date-fns"
import { getArticleFixtures, getArticleTagFixtures, getArticleTagLinkFixtures } from "./fixtures/article"
import { getAttendanceFixtures } from "./fixtures/attendance"
import { getPoolFixtures } from "./fixtures/attendance-pool"
import { buildAttendancePoolMap, getAttendeeFixtures, VOLLEYBALL_ATTENDEE_FIXTURE_IDS } from "./fixtures/attendee"
import { getCompanyFixtures } from "./fixtures/company"
import { FADDERUKE_CONTEST_ID, getContestFixture, getContestTeamFixtures } from "./fixtures/contest"
import { getDeregisterReasonFixtures } from "./fixtures/deregister-reason"
import { FADDERUKE_EVENT_ID, getEventFixtures, VOLLEYBALL_EVENT_ID } from "./fixtures/event"
import { getEventCompany } from "./fixtures/event-company"
import { getEventHostingGroupFixtures } from "./fixtures/event-hosting-group"
import { getFadderukeFixture } from "./fixtures/fadderuke"
import { getFeedbackFormFixture } from "./fixtures/feedback-form"
import { getFeedbackAnswerEventFormFixture, getFeedbackFormAnswerFixtures } from "./fixtures/feedback-form-answers"
import { getGroupFixtures, getGroupRoleFixtures } from "./fixtures/group"
import { getGroupMembershipFixtures } from "./fixtures/group-membership"
import { getGroupMembershipRoleFixtures } from "./fixtures/group-membership-role"
import {
  getInterestGroupEventFixtures,
  getInterestGroupEventRegistrationFixtures,
  getInterestGroupEventRequestFixtures,
} from "./fixtures/interest-group-event"
import { getJobListingFixtures, getJobListingLocationFixtures } from "./fixtures/job-listing"
import { getMarkFixtures, getMarkGroupFixtures } from "./fixtures/mark"
import { getMembershipFixtures } from "./fixtures/membership"
import { getNotificationFixtures } from "./fixtures/notification"
import { getNotificationPermissionsFixtures } from "./fixtures/notification-permissions"
import { getOfflineFixtures } from "./fixtures/offline"
import { getPersonalMarkFixtures } from "./fixtures/personal-mark"
import { getPrivacyPermissionsFixtures } from "./fixtures/privacy-permissions"
import { getUserFixtures } from "./fixtures/user"
import { EXCEPTIONALLY_DISTINGUISHED_FLAG_NAME, getUserFlagLinkFixtures } from "./fixtures/user-flag-link"
import { createPrisma } from "./index"

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

const privacyPermissions = await db.privacyPermissions.createManyAndReturn({
  data: getPrivacyPermissionsFixtures(userIds),
})
for (const permission of privacyPermissions) {
  await db.user.update({
    where: { id: permission.userId },
    data: { privacyPermissionsId: permission.id },
  })
}

const notificationPermissions = await db.notificationPermissions.createManyAndReturn({
  data: getNotificationPermissionsFixtures(userIds),
})
for (const permission of notificationPermissions) {
  await db.user.update({
    where: { id: permission.userId },
    data: { notificationPermissionsId: permission.id },
  })
}

const exceptionallyDistinguishedFlag = await db.userFlag.findUniqueOrThrow({
  where: { name: EXCEPTIONALLY_DISTINGUISHED_FLAG_NAME },
})
const userFlagLinkInput = getUserFlagLinkFixtures(userIds, exceptionallyDistinguishedFlag.id)
await db.userFlagLink.createMany({ data: userFlagLinkInput })

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

const interestGroupEventInput = getInterestGroupEventFixtures()
await db.interestGroupEvent.createMany({ data: interestGroupEventInput })
await db.interestGroupEventRegistration.createMany({
  data: getInterestGroupEventRegistrationFixtures(userIds),
})
await db.interestGroupEventRequest.createMany({
  data: getInterestGroupEventRequestFixtures(userIds),
})

const attendanceInput = getAttendanceFixtures()
const attendances = await db.attendance.createManyAndReturn({ data: attendanceInput })
const eventInput = getEventFixtures(attendances.map((a) => a.id))
const events = await db.event.createManyAndReturn({ data: eventInput })
const eventIds = events.map((event) => event.id)
const companyIds = companies.map((company) => company.id)
await db.eventCompany.createMany({ data: getEventCompany(eventIds, companyIds) })
const attendanceIds = attendances.map((attendance) => attendance.id)
const attendancePoolInput = getPoolFixtures(attendanceIds)
const attendancePools = await db.attendancePool.createManyAndReturn({ data: attendancePoolInput })
const attendancePoolMap = buildAttendancePoolMap(attendancePools)
const attendeeInput = getAttendeeFixtures(attendancePoolMap, attendanceIds, userIds)
await db.attendee.createMany({ data: attendeeInput })
const eventHostingGroupInput = getEventHostingGroupFixtures(events.map((e) => e.id))
await db.eventHostingGroup.createManyAndReturn({ data: eventHostingGroupInput })

const nearestEvent = events
  .filter((event) => isFuture(event.start))
  .toSorted((a, b) => compareAsc(a.start, b.start))
  .at(0)
if (nearestEvent === undefined) {
  throw new Error("Missing future event for feedback form fixture")
}

const volleyballEvent = events.find((event) => event.id === VOLLEYBALL_EVENT_ID)
if (volleyballEvent === undefined) {
  throw new Error("Missing volleyball event for feedback form fixture")
}

await db.feedbackForm.create({ data: getFeedbackFormFixture(nearestEvent) })
await db.feedbackForm.create({
  data: getFeedbackAnswerEventFormFixture(volleyballEvent),
})

for (const feedbackFormAnswer of getFeedbackFormAnswerFixtures(VOLLEYBALL_ATTENDEE_FIXTURE_IDS)) {
  await db.feedbackFormAnswer.create({ data: feedbackFormAnswer })
}

const marks = await db.mark.createManyAndReturn({ data: getMarkFixtures() })
const markIds = marks.map((mark) => mark.id)
await db.markGroup.createMany({ data: getMarkGroupFixtures(markIds) })
await db.personalMark.createMany({
  data: getPersonalMarkFixtures(markIds, userIds[0]),
})

const jobListingInput = getJobListingFixtures(companies.map((company) => company.id))
const jobListings = await db.jobListing.createManyAndReturn({ data: jobListingInput })
const jobListingLocationInput = getJobListingLocationFixtures(jobListings.map((jobListing) => jobListing.id))
await db.jobListingLocation.createManyAndReturn({ data: jobListingLocationInput })

await db.articleTag.createMany({ data: getArticleTagFixtures() })
await db.article.createMany({ data: getArticleFixtures() })
await db.articleTagLink.createMany({ data: getArticleTagLinkFixtures() })

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

await db.deregisterReason.createMany({
  data: getDeregisterReasonFixtures(userIds[8]),
})

for (const notification of getNotificationFixtures({
  createdByUserId: userIds[0],
  recipientUserIds: userIds.slice(0, 6),
})) {
  await db.notification.create({ data: notification })
}

const offlineInput = getOfflineFixtures()
await db.offline.createMany({ data: offlineInput })
