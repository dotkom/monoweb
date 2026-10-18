import { createPrisma } from "./index"
import { getArticleFixtures, getArticleTagFixtures, getArticleTagLinkFixtures } from "./fixtures/article"
import { getAttendanceFixtures } from "./fixtures/attendance"
import { getPoolFixtures } from "./fixtures/attendance-pool"
import { getAttendeeFixtures } from "./fixtures/attendee"
import { getCompanyFixtures } from "./fixtures/company"
import {
  fixtureContestId,
  getContestFixture,
  getContestTeamFixtures,
  getContestTeamMemberIds,
} from "./fixtures/contest"
import { getDeregisterReasonFixtures } from "./fixtures/deregister-reason"
import { eventId, getEventFixtures } from "./fixtures/event"
import { getEventCompanyFixtures } from "./fixtures/event-company"
import { getEventHostingGroupFixtures } from "./fixtures/event-hosting-group"
import { getFadderukeFixture } from "./fixtures/fadderuke"
import { getFeedbackFormFixture } from "./fixtures/feedback-form"
import { getFeedbackAnswerEventFormFixture, getFeedbackFormAnswerFixtures } from "./fixtures/feedback-form-answers"
import { getGroupFixtures, getGroupRoleFixtures } from "./fixtures/group"
import { getGroupMembershipFixtures } from "./fixtures/group-membership"
import { getGroupMembershipRoleFixtures } from "./fixtures/group-membership-role"
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

if (process.env.DATABASE_URL === undefined) {
  throw new Error("Missing database url")
}

if (process.env.DATABASE_URL.includes("prod")) {
  throw new Error("Tried adding fixtures to a production database")
}

const db = createPrisma(process.env.DATABASE_URL)

// The ordering of things is *somewhat* important here, as some things depend on others.

for (const user of getUserFixtures()) {
  await db.user.upsert({
    where: { username: user.username },
    create: user,
    update: {},
  })
}

for (const membership of getMembershipFixtures()) {
  await db.membership.upsert({
    where: { id: membership.id },
    create: membership,
    update: {},
  })
}

for (const permission of getPrivacyPermissionsFixtures()) {
  const row = await db.privacyPermissions.upsert({
    where: { userId: permission.userId },
    create: permission,
    update: {},
  })
  await db.user.update({
    where: { id: permission.userId },
    data: { privacyPermissionsId: row.id },
  })
}

for (const permission of getNotificationPermissionsFixtures()) {
  const row = await db.notificationPermissions.upsert({
    where: { userId: permission.userId },
    create: permission,
    update: {},
  })
  await db.user.update({
    where: { id: permission.userId },
    data: { notificationPermissionsId: row.id },
  })
}

const exceptionallyDistinguishedFlag = await db.userFlag.findUniqueOrThrow({
  where: { name: EXCEPTIONALLY_DISTINGUISHED_FLAG_NAME },
})

for (const userFlagLink of getUserFlagLinkFixtures(exceptionallyDistinguishedFlag.id)) {
  await db.userFlagLink.upsert({
    where: { id: userFlagLink.id },
    create: userFlagLink,
    update: {},
  })
}

for (const company of getCompanyFixtures()) {
  await db.company.upsert({
    where: { slug: company.slug },
    create: company,
    update: {},
  })
}

const groupInput = getGroupFixtures()
for (const group of groupInput) {
  await db.group.upsert({
    where: { slug: group.slug },
    create: group,
    update: {},
  })

  for (const role of getGroupRoleFixtures(group)) {
    await db.groupRole.upsert({
      where: {
        groupId_name: {
          groupId: role.groupId,
          name: role.name,
        },
      },
      create: role,
      update: {},
    })
  }
}

const groupRoleIds = new Map(
  (await db.groupRole.findMany({ select: { id: true, groupId: true, type: true } })).map(
    (role) => [`${role.groupId}:${role.type}`, role.id] as const
  )
)

for (const groupMembership of getGroupMembershipFixtures()) {
  await db.groupMembership.upsert({
    where: { id: groupMembership.id },
    create: groupMembership,
    update: {},
  })
}

await db.groupMembershipRole.createMany({
  data: getGroupMembershipRoleFixtures(groupRoleIds),
  skipDuplicates: true,
})

for (const attendance of getAttendanceFixtures()) {
  await db.attendance.upsert({
    where: { id: attendance.id },
    create: attendance,
    update: {},
  })
}

for (const event of getEventFixtures()) {
  await db.event.upsert({
    where: { id: event.id },
    create: event,
    update: {},
  })
}

await db.eventCompany.createMany({
  data: getEventCompanyFixtures(),
  skipDuplicates: true,
})

for (const pool of getPoolFixtures()) {
  await db.attendancePool.upsert({
    where: { id: pool.id },
    create: pool,
    update: {},
  })
}

for (const attendee of getAttendeeFixtures()) {
  await db.attendee.upsert({
    where: {
      attendee_unique: {
        attendanceId: attendee.attendanceId,
        userId: attendee.userId,
      },
    },
    create: attendee,
    update: {},
  })
}

await db.eventHostingGroup.createMany({
  data: getEventHostingGroupFixtures(),
  skipDuplicates: true,
})

const nearestEvent = (
  await db.event.findMany({
    where: { start: { gt: new Date() } },
    orderBy: { start: "asc" },
    take: 1,
  })
).at(0)

if (nearestEvent === undefined) {
  throw new Error("Missing future event for feedback form fixture")
}

const volleyballEvent = await db.event.findUniqueOrThrow({
  where: { id: eventId("volleyball") },
})

await db.feedbackForm.upsert({
  where: { eventId: nearestEvent.id },
  create: getFeedbackFormFixture(nearestEvent),
  update: {},
})

await db.feedbackForm.upsert({
  where: { id: getFeedbackAnswerEventFormFixture(volleyballEvent).id },
  create: getFeedbackAnswerEventFormFixture(volleyballEvent),
  update: {},
})

for (const feedbackFormAnswer of getFeedbackFormAnswerFixtures()) {
  await db.feedbackFormAnswer.upsert({
    where: { attendeeId: feedbackFormAnswer.attendeeId },
    create: feedbackFormAnswer,
    update: {},
  })
}

for (const mark of getMarkFixtures()) {
  await db.mark.upsert({
    where: { id: mark.id },
    create: mark,
    update: {},
  })
}

await db.markGroup.createMany({
  data: getMarkGroupFixtures(),
  skipDuplicates: true,
})

await db.personalMark.createMany({
  data: getPersonalMarkFixtures(),
  skipDuplicates: true,
})

for (const jobListing of getJobListingFixtures()) {
  await db.jobListing.upsert({
    where: { id: jobListing.id },
    create: jobListing,
    update: {},
  })
}

await db.jobListingLocation.createMany({
  data: getJobListingLocationFixtures(),
  skipDuplicates: true,
})

await db.articleTag.createMany({
  data: getArticleTagFixtures(),
  skipDuplicates: true,
})

for (const article of getArticleFixtures()) {
  await db.article.upsert({
    where: { slug: article.slug },
    create: article,
    update: {},
  })
}

await db.articleTagLink.createMany({
  data: getArticleTagLinkFixtures(),
  skipDuplicates: true,
})

await db.contest.upsert({
  where: { id: fixtureContestId.fadderuke },
  create: getContestFixture(),
  update: {},
})

const contestTeamFixtures = getContestTeamFixtures()
for (const { contestant } of contestTeamFixtures) {
  await db.contestant.upsert({
    where: { id: contestant.id },
    create: contestant,
    update: {},
  })
}

for (const { team } of contestTeamFixtures) {
  await db.contestTeam.upsert({
    where: { id: team.id },
    create: {
      id: team.id,
      name: team.name,
      contestantId: team.contestantId,
      members: {
        connect: getContestTeamMemberIds(team.memberUserKeys).map((memberUserId) => ({ id: memberUserId })),
      },
    },
    update: {},
  })
}

await db.contest.update({
  where: { id: fixtureContestId.fadderuke },
  data: { winnerContestantId: contestTeamFixtures[0].contestant.id },
})

await db.event.update({
  where: { id: eventId("fadderuke") },
  data: { contestId: fixtureContestId.fadderuke },
})

const fadderukeYear = getFadderukeFixture().year
await db.fadderuke.upsert({
  where: { year: fadderukeYear },
  create: getFadderukeFixture(),
  update: {},
})

for (const deregisterReason of getDeregisterReasonFixtures()) {
  await db.deregisterReason.upsert({
    where: { id: deregisterReason.id },
    create: deregisterReason,
    update: {},
  })
}

for (const notification of getNotificationFixtures()) {
  await db.notification.upsert({
    where: { id: notification.id },
    create: notification,
    update: {},
  })
}

for (const offline of getOfflineFixtures()) {
  await db.offline.upsert({
    where: { id: offline.id },
    create: offline,
    update: {},
  })
}
