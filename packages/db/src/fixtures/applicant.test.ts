import assert from "node:assert/strict"
import { test } from "node:test"
import { TZDate } from "@date-fns/tz"
import { CommitteeApplicationGroupType, CommitteeApplicationInterviewDuration, Gender } from "../"
import {
  APPLICANT_FIXTURE_EMAIL_DOMAIN,
  APPLICANT_FIXTURE_GROUP_SLUGS,
  APPLICANT_FIXTURE_PERIOD_IDS,
  APPLICANTS_PER_PERIOD,
  getApplicantFixtures,
} from "./applicant"
import { getCommitteeApplicationFixtures } from "./committee-application"
import { getGroupFixtures } from "./group"
import { getUserFixtures } from "./user"

const NOW = new Date("2026-10-14T09:30:00Z")
const MAZEMAP_ROOM_LINK_PATTERN = /^https:\/\/use\.mazemap\.com\/#v=1&campusid=\d+&sharepoitype=poi&sharepoi=\d+$/
const BUFFER_MILLISECONDS = 15 * 60_000

const fixtures = getApplicantFixtures(NOW)

function osloCalendarDate(date: Date) {
  const osloDate = new TZDate(date, "Europe/Oslo")
  return Date.UTC(osloDate.getFullYear(), osloDate.getMonth(), osloDate.getDate())
}

function assertWithinInterviewHours(startsAt: Date, endsAt: Date, period: (typeof fixtures.periods)[number]) {
  const start = new TZDate(startsAt, "Europe/Oslo")
  const end = new TZDate(endsAt, "Europe/Oslo")
  assert.ok(startsAt < endsAt)
  assert.equal(osloCalendarDate(startsAt), osloCalendarDate(endsAt))
  assert.ok(start.getDay() >= 1 && start.getDay() <= 5)
  assert.ok(start.getHours() >= 9)
  assert.ok(end.getHours() < 17 || (end.getHours() === 17 && end.getMinutes() === 0))
  assert.ok(osloCalendarDate(startsAt) >= period.interviewsStartDate.getTime())
  assert.ok(osloCalendarDate(startsAt) <= period.interviewsEndDate.getTime())
}

test("fixtures are deterministic for the same point in time", () => {
  const again = getApplicantFixtures(NOW)
  assert.deepEqual(
    again.users.map((user) => user.id),
    fixtures.users.map((user) => user.id)
  )
  assert.deepEqual(
    again.applications.map((application) => application.id),
    fixtures.applications.map((application) => application.id)
  )
  assert.deepEqual(
    again.interviews.map((interview) => interview.id),
    fixtures.interviews.map((interview) => interview.id)
  )
})

test("user ids stay stable when the fixtures are generated at another time", () => {
  const later = getApplicantFixtures(new Date("2027-03-02T15:00:00Z"))
  assert.deepEqual(
    later.users.map((user) => user.id),
    fixtures.users.map((user) => user.id)
  )
})

test("bulk users have contact details and never collide with the primary fixtures", () => {
  const primaryUsers = getUserFixtures()
  const primaryIds = new Set<string>(primaryUsers.map((user) => user.id))
  const primaryUsernames = new Set<string>(primaryUsers.map((user) => user.username))
  assert.ok(fixtures.users.length >= 900)
  assert.equal(new Set(fixtures.users.map((user) => user.id)).size, fixtures.users.length)
  assert.equal(new Set(fixtures.users.map((user) => user.username)).size, fixtures.users.length)
  assert.equal(new Set(fixtures.users.map((user) => user.email)).size, fixtures.users.length)

  for (const user of fixtures.users) {
    assert.ok(!primaryIds.has(user.id))
    assert.ok(!primaryUsernames.has(user.username))
    assert.ok(user.username.startsWith("opptak-"))
    assert.match(user.email ?? "", new RegExp(`^[a-z0-9.]+@${APPLICANT_FIXTURE_EMAIL_DOMAIN.replace(".", "\\.")}$`))
    assert.match(user.phone ?? "", /^\+47 [49]\d{2} \d{2} \d{3}$/)
    assert.ok((user.name ?? "").length > 0)
  }

  for (const users of [fixtures.memberships, fixtures.privacyPermissions, fixtures.notificationPermissions]) {
    assert.deepEqual(new Set(users.map((row) => row.userId)), new Set(fixtures.users.map((user) => user.id)))
  }
})

test("fixture periods never collide with the primary committee application period", () => {
  const primary = getCommitteeApplicationFixtures(getUserFixtures(), NOW)
  const periodIds = Object.values(APPLICANT_FIXTURE_PERIOD_IDS)
  assert.ok(!periodIds.includes(primary.applicationPeriod.id as (typeof periodIds)[number]))
  assert.deepEqual(new Set(fixtures.periods.map((period) => period.id)), new Set(periodIds))
})

test("each committee has between 10 and 15 active members from the bulk users", () => {
  const groupSlugs = new Set<string>(getGroupFixtures().map((group) => group.slug))
  const userIds = new Set(fixtures.users.map((user) => user.id))

  for (const slug of APPLICANT_FIXTURE_GROUP_SLUGS) {
    assert.ok(groupSlugs.has(slug))
    const members = fixtures.groupMemberships.filter((membership) => membership.groupId === slug)
    assert.ok(members.length >= 10 && members.length <= 15, `${slug} has ${members.length} members`)

    for (const membership of members) {
      assert.ok(userIds.has(membership.userId))
      assert.equal(membership.end, null)
      assert.ok(membership.start <= NOW)
    }
  }
})

test("periods are in the expected stage of the flow", () => {
  const periods = new Map(fixtures.periods.map((period) => [period.id, period]))
  const open = periods.get(APPLICANT_FIXTURE_PERIOD_IDS.open)
  const readyForMatching = periods.get(APPLICANT_FIXTURE_PERIOD_IDS.readyForMatching)
  const matched = periods.get(APPLICANT_FIXTURE_PERIOD_IDS.matched)
  const published = periods.get(APPLICANT_FIXTURE_PERIOD_IDS.published)
  assert.ok(open && readyForMatching && matched && published)

  for (const period of fixtures.periods) {
    assert.equal(period.isDraft, false)
    assert.equal(period.isEnabled, true)
    assert.ok(period.applicationsOpenAt < NOW)
    assert.ok(osloCalendarDate(period.applicationsCloseAt) < period.interviewsStartDate.getTime())
    assert.ok(period.interviewsStartDate <= period.interviewsEndDate)
  }

  assert.ok(open.applicationsCloseAt > NOW)
  assert.equal(open.interviewsPublishedAt, null)

  for (const period of [readyForMatching, matched, published]) {
    assert.ok(period.applicationsCloseAt < NOW)
  }

  assert.equal(readyForMatching.interviewsPublishedAt, null)
  assert.equal(matched.interviewsPublishedAt, null)
  assert.ok(published.interviewsPublishedAt !== null)
  assert.ok(published.interviewsPublishedAt > published.applicationsCloseAt)
  assert.ok(published.interviewsPublishedAt < NOW)

  const periodIdsWithInterviews = new Set(
    fixtures.interviews.map(
      (interview) => fixtures.groups.find((group) => group.id === interview.applicationGroupId)?.applicationPeriodId
    )
  )
  assert.deepEqual(periodIdsWithInterviews, new Set([matched.id, published.id]))

  for (const period of [readyForMatching, matched, published]) {
    for (const group of fixtures.groups.filter((candidate) => candidate.applicationPeriodId === period.id)) {
      assert.ok(fixtures.interviewBlocks.some((block) => block.applicationGroupId === group.id))
    }
  }

  const groupsWithBlocksInOpenPeriod = fixtures.groups.filter(
    (group) =>
      group.applicationPeriodId === open.id &&
      fixtures.interviewBlocks.some((block) => block.applicationGroupId === group.id)
  )
  assert.ok(groupsWithBlocksInOpenPeriod.length > 0)
  assert.ok(groupsWithBlocksInOpenPeriod.length < APPLICANT_FIXTURE_GROUP_SLUGS.length)
})

test("applications follow the selection rules", () => {
  const users = new Map(fixtures.users.map((user) => [user.id, user]))
  const groups = new Map(fixtures.groups.map((group) => [group.id, group]))

  for (const period of fixtures.periods) {
    const applications = fixtures.applications.filter((application) => application.applicationPeriodId === period.id)
    const periodGroups = fixtures.groups.filter((group) => group.applicationPeriodId === period.id)
    assert.equal(applications.length, APPLICANTS_PER_PERIOD)
    assert.equal(new Set(applications.map((application) => application.userId)).size, applications.length)
    assert.deepEqual(new Set(periodGroups.map((group) => group.groupId)), new Set(APPLICANT_FIXTURE_GROUP_SLUGS))

    for (const application of applications) {
      const applicant = users.get(application.userId)
      assert.ok(applicant)
      assert.ok(application.aboutMe.length > 0)
      assert.ok(application.studyYear !== null && application.studyYear !== undefined)
      assert.ok(application.studyYear >= 1 && application.studyYear <= 5)
      assert.ok(application.createdAt >= period.applicationsOpenAt)
      assert.ok(application.createdAt <= period.applicationsCloseAt && application.createdAt <= NOW)

      const selections = fixtures.groupSelections.filter((selection) => selection.applicationId === application.id)
      assert.ok(selections.length > 0)
      assert.equal(new Set(selections.map((selection) => selection.applicationGroupId)).size, selections.length)
      const ranks = selections
        .map((selection) => selection.rank)
        .filter((rank): rank is number => rank !== null && rank !== undefined)
        .sort((first, second) => first - second)
      assert.ok(ranks.length <= 3)
      assert.deepEqual(
        ranks,
        Array.from({ length: ranks.length }, (_, index) => index + 1)
      )

      for (const selection of selections) {
        const group = groups.get(selection.applicationGroupId)
        assert.ok(group)
        assert.equal(group.applicationPeriodId, period.id)
        assert.equal(selection.applicationPeriodId, period.id)
        assert.equal(selection.rank === null, group.type === CommitteeApplicationGroupType.ADDITIVE)

        if (group.groupId === "feminit") {
          assert.equal(applicant.gender, Gender.FEMALE)
        }
      }

      const availability = fixtures.availabilityBlocks.filter((block) => block.applicationId === application.id)
      assert.ok(availability.length >= 3)

      for (const block of availability) {
        assertWithinInterviewHours(new Date(block.startsAt), new Date(block.endsAt), period)
      }
    }
  }
})

test("interview blocks are valid for the admin availability page", () => {
  const groups = new Map(fixtures.groups.map((group) => [group.id, group]))
  const periods = new Map(fixtures.periods.map((period) => [period.id, period]))

  for (const block of fixtures.interviewBlocks) {
    const group = groups.get(block.applicationGroupId)
    assert.ok(group)
    const period = periods.get(group.applicationPeriodId)
    assert.ok(period)
    assertWithinInterviewHours(block.startsAt, block.endsAt, period)
    assert.ok(block.locationName.trim().length > 0)
    assert.match(block.locationUrl ?? "", MAZEMAP_ROOM_LINK_PATTERN)

    const otherBlocksInRoom = fixtures.interviewBlocks.filter((candidate) => {
      const candidateGroup = groups.get(candidate.applicationGroupId)
      return (
        candidate.id !== block.id &&
        candidateGroup?.applicationPeriodId === group.applicationPeriodId &&
        candidate.locationName === block.locationName
      )
    })

    for (const other of otherBlocksInRoom) {
      assert.ok(other.endsAt <= block.startsAt || other.startsAt >= block.endsAt, "room double-booked")
    }
  }
})

test("generated interviews satisfy the same rules the backend checks on confirm", () => {
  const groups = new Map(fixtures.groups.map((group) => [group.id, group]))
  const periods = new Map(fixtures.periods.map((period) => [period.id, period]))
  const selections = new Map(fixtures.groupSelections.map((selection) => [selection.id, selection]))
  const blocks = new Map(fixtures.interviewBlocks.map((block) => [block.id, block]))
  const interviewsByApplication = new Map<string, typeof fixtures.interviews>()

  assert.equal(
    new Set(fixtures.interviews.map((interview) => interview.groupSelectionId)).size,
    fixtures.interviews.length
  )
  assert.equal(
    new Set(fixtures.interviews.map((interview) => `${interview.interviewBlockId}|${interview.startsAt.toISOString()}`))
      .size,
    fixtures.interviews.length
  )

  for (const interview of fixtures.interviews) {
    const selection = selections.get(interview.groupSelectionId)
    const group = groups.get(interview.applicationGroupId)
    const block = blocks.get(interview.interviewBlockId)
    assert.ok(selection && group && block)
    const period = periods.get(group.applicationPeriodId)
    assert.ok(period)
    assert.equal(selection.applicationGroupId, group.id)
    assert.equal(block.applicationGroupId, group.id)
    assertWithinInterviewHours(interview.startsAt, interview.endsAt, period)

    const minutes = group.interviewDuration === CommitteeApplicationInterviewDuration.MINUTES_30 ? 30 : 20
    assert.equal(interview.endsAt.getTime() - interview.startsAt.getTime(), minutes * 60_000)
    assert.ok(interview.startsAt >= block.startsAt && interview.endsAt <= block.endsAt)

    const availability = fixtures.availabilityBlocks.filter(
      (candidate) => candidate.applicationId === selection.applicationId
    )
    assert.ok(
      availability.some(
        (candidate) =>
          new Date(candidate.startsAt) <= interview.startsAt && new Date(candidate.endsAt) >= interview.endsAt
      ),
      "interview outside applicant availability"
    )

    const applicationInterviews = interviewsByApplication.get(selection.applicationId) ?? []
    applicationInterviews.push(interview)
    interviewsByApplication.set(selection.applicationId, applicationInterviews)
  }

  for (const applicationInterviews of interviewsByApplication.values()) {
    const sorted = applicationInterviews.toSorted(
      (first, second) => first.startsAt.getTime() - second.startsAt.getTime()
    )

    for (let index = 1; index < sorted.length; index += 1) {
      assert.ok(
        sorted[index].startsAt.getTime() - sorted[index - 1].endsAt.getTime() >= BUFFER_MILLISECONDS,
        "applicant has less than 15 minutes between interviews"
      )
    }
  }

  for (const periodId of [APPLICANT_FIXTURE_PERIOD_IDS.matched, APPLICANT_FIXTURE_PERIOD_IDS.published]) {
    const periodSelections = fixtures.groupSelections.filter((selection) => selection.applicationPeriodId === periodId)
    const interviewed = periodSelections.filter((selection) =>
      fixtures.interviews.some((interview) => interview.groupSelectionId === selection.id)
    )
    const matchedShare = interviewed.length / periodSelections.length
    assert.ok(matchedShare > 0.85 && matchedShare < 1, `matched share ${matchedShare}`)
  }
})

test("interview attendees are members of the committee they interview for", () => {
  const groups = new Map(fixtures.groups.map((group) => [group.id, group]))
  const selections = new Map(fixtures.groupSelections.map((selection) => [selection.id, selection]))
  const keys = new Set<string>()
  assert.ok(fixtures.interviewAttendees.length > 0)

  for (const attendee of fixtures.interviewAttendees) {
    const key = `${attendee.groupSelectionId}|${attendee.userId}`
    assert.ok(!keys.has(key))
    keys.add(key)
    const selection = selections.get(attendee.groupSelectionId)
    assert.ok(selection)
    assert.notEqual(selection.applicationPeriodId, APPLICANT_FIXTURE_PERIOD_IDS.open)
    const group = groups.get(selection.applicationGroupId)
    assert.ok(group)
    assert.ok(
      fixtures.groupMemberships.some(
        (membership) => membership.groupId === group.groupId && membership.userId === attendee.userId
      )
    )
  }
})
