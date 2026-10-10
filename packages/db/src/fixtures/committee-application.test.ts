import assert from "node:assert/strict"
import { test } from "node:test"
import { TZDate } from "@date-fns/tz"
import { faker } from "@faker-js/faker"
import { CommitteeApplicationGroupType, CommitteeApplicationInterviewDuration, Gender } from "../"
import { getCommitteeApplicationFixtures } from "./committee-application"
import { getGroupFixtures } from "./group"
import { getUserFixtures } from "./user"

test("application windows follow Oslo calendar weeks, including daylight saving transitions", () => {
  const scenarios = [
    ["2026-01-07T12:00:00Z", "2026-01-04T23:00:00.000Z", "2026-01-11T21:00:00.000Z", "2026-01-12"],
    ["2026-07-08T12:00:00Z", "2026-07-05T22:00:00.000Z", "2026-07-12T20:00:00.000Z", "2026-07-13"],
    ["2026-03-25T12:00:00Z", "2026-03-22T23:00:00.000Z", "2026-03-29T20:00:00.000Z", "2026-03-30"],
    ["2026-10-21T12:00:00Z", "2026-10-18T22:00:00.000Z", "2026-10-25T21:00:00.000Z", "2026-10-26"],
    ["2026-10-04T22:00:00Z", "2026-10-04T22:00:00.000Z", "2026-10-11T20:00:00.000Z", "2026-10-12"],
  ]

  for (const [currentTime, expectedOpen, expectedClose, expectedInterviewStart] of scenarios) {
    faker.seed(1)
    const { applicationPeriod } = getCommitteeApplicationFixtures(getUserFixtures(), new Date(currentTime))
    assert.equal(applicationPeriod.applicationsOpenAt.toISOString(), expectedOpen)
    assert.equal(applicationPeriod.applicationsCloseAt.toISOString(), expectedClose)
    assert.equal(applicationPeriod.interviewStartDate.toISOString().slice(0, 10), expectedInterviewStart)
    assert.equal(applicationPeriod.isDraft, true)
    assert.equal(applicationPeriod.isEnabled, true)
  }
})

test("empty user fixtures still produce one draft period and all participating committees", () => {
  const fixtures = getCommitteeApplicationFixtures([], new Date("2026-10-06T12:00:00Z"))
  assert.equal(fixtures.groups.length, 12)
  assert.equal(fixtures.applications.length, 0)
  assert.equal(fixtures.groupSelections.length, 0)
  assert.equal(fixtures.interviews.length, 0)
  assert.equal(fixtures.availabilityBlocks.length, 0)
})

test("randomized fixtures obey eligibility, ranking, availability and interview scheduling constraints", () => {
  const users = getUserFixtures()
  const fixtureGroupSlugs = new Set<string>(getGroupFixtures().map((group) => group.slug))
  const applicantCounts = new Set<number>()

  for (let seed = 0; seed < 100; seed += 1) {
    faker.seed(seed)
    const fixtures = getCommitteeApplicationFixtures(users, new Date("2026-10-06T12:00:00Z"))
    const groups = new Map(fixtures.groups.map((group) => [group.id, group]))
    const selections = new Map(fixtures.groupSelections.map((selection) => [selection.id, selection]))
    applicantCounts.add(fixtures.applications.length)
    assert.equal(fixtures.groups.filter((group) => group.type === CommitteeApplicationGroupType.EXCLUSIVE).length, 9)
    assert.equal(fixtures.groups.filter((group) => group.type === CommitteeApplicationGroupType.ADDITIVE).length, 3)
    assert.equal(new Set(fixtures.groups.map((group) => group.groupId)).size, 12)
    assert.equal(new Set(fixtures.groups.map((group) => group.interviewDuration)).size, 2)

    for (const group of fixtures.groups) {
      assert.ok(fixtureGroupSlugs.has(group.groupId))
      assert.equal(group.applicationPeriodId, fixtures.applicationPeriod.id)
    }

    assert.equal(
      new Set(fixtures.applications.map((application) => application.userId)).size,
      fixtures.applications.length
    )
    assert.equal(fixtures.interviews.length, fixtures.groupSelections.length)
    assert.equal(
      new Set(fixtures.interviews.map((interview) => interview.groupSelectionId)).size,
      fixtures.interviews.length
    )

    for (const application of fixtures.applications) {
      const applicant = users.find((user) => user.id === application.userId)
      assert.ok(applicant)
      assert.equal(application.applicationPeriodId, fixtures.applicationPeriod.id)
      assert.ok(application.aboutMe.length > 0)
      const applicationSelections = fixtures.groupSelections.filter(
        (selection) => selection.applicationId === application.id
      )
      assert.ok(applicationSelections.length > 0)
      assert.equal(
        new Set(applicationSelections.map((selection) => selection.applicationGroupId)).size,
        applicationSelections.length
      )
      assert.deepEqual(
        applicationSelections.map((selection) => selection.rank).sort((first, second) => first - second),
        Array.from({ length: applicationSelections.length }, (_, rankIndex) => rankIndex + 1)
      )
      let exclusiveCount = 0

      for (const selection of applicationSelections) {
        const group = groups.get(selection.applicationGroupId)
        assert.ok(group)
        assert.equal(selection.applicationPeriodId, fixtures.applicationPeriod.id)

        if (group.type === CommitteeApplicationGroupType.EXCLUSIVE) {
          exclusiveCount += 1
        }

        if (group.groupId === "feminit") {
          assert.equal(applicant.gender, Gender.FEMALE)
        }
      }

      assert.ok(exclusiveCount <= 3)
      const applicationInterviews = fixtures.interviews
        .filter((interview) => selections.get(interview.groupSelectionId)?.applicationId === application.id)
        .sort((first, second) => first.startsAt.getTime() - second.startsAt.getTime())
      const availability = fixtures.availabilityBlocks.filter((block) => block.applicationId === application.id)

      for (const [interviewIndex, interview] of applicationInterviews.entries()) {
        assert.ok(
          availability.some(
            (block) => new Date(block.startsAt) <= interview.startsAt && new Date(block.endsAt) >= interview.endsAt
          )
        )

        if (interviewIndex > 0) {
          assert.ok(applicationInterviews[interviewIndex - 1].endsAt <= interview.startsAt)
        }
      }
    }

    for (const block of fixtures.interviewBlocks) {
      const blockInterviews = fixtures.interviews.filter((interview) => interview.interviewBlockId === block.id)
      assert.ok(blockInterviews.length > 0)
      assert.equal(block.startsAt.getTime(), blockInterviews[0].startsAt.getTime())
      assert.equal(block.endsAt.getTime(), blockInterviews[blockInterviews.length - 1].endsAt.getTime())

      for (const [interviewIndex, interview] of blockInterviews.entries()) {
        const group = groups.get(interview.applicationGroupId)
        assert.ok(group)
        assert.equal(block.applicationGroupId, group.id)
        assert.equal(selections.get(interview.groupSelectionId)?.applicationGroupId, group.id)
        const startsAt = new TZDate(interview.startsAt, "Europe/Oslo")
        const endsAt = new TZDate(interview.endsAt, "Europe/Oslo")
        assert.ok(startsAt.getHours() >= 8)
        assert.ok(endsAt.getHours() < 17 || (endsAt.getHours() === 17 && endsAt.getMinutes() === 0))
        assert.ok(startsAt.getDay() >= 1 && startsAt.getDay() <= 5)
        assert.equal(startsAt.getDate(), endsAt.getDate())
        const interviewCalendarDate = Date.UTC(startsAt.getFullYear(), startsAt.getMonth(), startsAt.getDate())
        assert.ok(interviewCalendarDate >= fixtures.applicationPeriod.interviewStartDate.getTime())
        assert.ok(interviewCalendarDate <= fixtures.applicationPeriod.interviewEndDate.getTime())
        let expectedMinutes = 20

        if (group.interviewDuration === CommitteeApplicationInterviewDuration.MINUTES_30) {
          expectedMinutes = 30
        }

        assert.equal(interview.endsAt.getTime() - interview.startsAt.getTime(), expectedMinutes * 60_000)

        if (interviewIndex > 0) {
          assert.equal(blockInterviews[interviewIndex - 1].endsAt.getTime(), interview.startsAt.getTime())
        }
      }
    }
  }

  assert.ok(applicantCounts.has(0))
  assert.ok(applicantCounts.has(users.length))
})

test("larger applicant lists split full days into compact blocks and extend the interview period", () => {
  const users = Array.from({ length: 150 }, (_, userIndex) => ({ id: `user-${userIndex}`, gender: Gender.FEMALE }))
  faker.seed(1)
  const fixtures = getCommitteeApplicationFixtures(users, new Date("2026-10-06T12:00:00Z"))
  assert.ok(fixtures.applications.length > 0)
  assert.equal(fixtures.interviews.length, fixtures.groupSelections.length)
  assert.ok(fixtures.applicationPeriod.interviewEndDate > new Date("2026-10-16"))

  for (const block of fixtures.interviewBlocks) {
    const startsAt = new TZDate(block.startsAt, "Europe/Oslo")
    const endsAt = new TZDate(block.endsAt, "Europe/Oslo")
    assert.equal(startsAt.getDate(), endsAt.getDate())
    assert.ok(startsAt.getHours() >= 8)
    assert.ok(endsAt.getHours() < 17 || (endsAt.getHours() === 17 && endsAt.getMinutes() === 0))
  }
})
