import { randomUUID } from "node:crypto"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { dbClient } from "../../../vitest-integration.setup"
import { FailedPreconditionError, NotFoundError } from "../../error"
import type { CommitteeApplicationInterviewMatcher, CommitteeApplicationSubmit } from "./committee-application"
import { getCommitteeApplicationRepository } from "./committee-application-repository"
import { getCommitteeApplicationService } from "./committee-application-service"

const openTime = new Date("2026-10-06T12:00:00Z")
const closedTime = new Date("2026-10-11T23:00:00Z")
const interviewStartsAt = new Date("2026-10-12T09:00:00Z")
const interviewEndsAt = new Date("2026-10-12T09:30:00Z")
const repository = getCommitteeApplicationRepository()

const interviewMatcher: CommitteeApplicationInterviewMatcher = async (input) => {
  const selection = input.groupSelections[0]
  const block = input.interviewBlocks.find((candidate) => candidate.applicationGroupId === selection.applicationGroupId)

  if (block === undefined) {
    throw new Error("The fixture must include an interview block")
  }

  return {
    interviews: [
      {
        groupSelectionId: selection.id,
        applicationGroupId: selection.applicationGroupId,
        interviewBlockId: block.id,
        startsAt: interviewStartsAt,
        endsAt: interviewEndsAt,
      },
    ],
  }
}

const service = getCommitteeApplicationService(repository, interviewMatcher)

async function createApplicationFixture() {
  const applicationPeriod = await dbClient.$transaction(async (handle) => {
    return service.createPeriod(handle, {
      applicationPeriod: {
        name: "Autumn applications",
        isDraft: false,
        isEnabled: true,
        applicationsOpenAt: new Date("2026-10-01T12:00:00Z"),
        applicationsCloseAt: new Date("2026-10-11T20:00:00Z"),
        interviewsStartDate: new Date("2026-10-12"),
        interviewsEndDate: new Date("2026-10-15"),
        interviewsStartTime: "09:00",
        interviewsEndTime: "17:00",
      },
      groups: [
        {
          groupId: "dotkom",
          type: "EXCLUSIVE",
          interviewDuration: "MINUTES_30",
        },
        {
          groupId: "backlog",
          type: "ADDITIVE",
          interviewDuration: "MINUTES_30",
        },
      ],
    })
  })

  const applicationGroups = await repository.findManyGroupsByPeriodId(dbClient, applicationPeriod.id)
  const exclusiveGroup = applicationGroups.find((group) => group.type === "EXCLUSIVE")

  if (exclusiveGroup === undefined) {
    throw new Error("The fixture must include an exclusive group")
  }

  for (const group of applicationGroups) {
    await dbClient.$transaction(async (handle) => {
      return service.setInterviewBlocks(handle, group.id, {
        interviewDuration: "MINUTES_30",
        interviewBlocks: [
          {
            id: randomUUID(),
            startsAt: new Date("2026-10-12T07:00:00Z"),
            endsAt: new Date("2026-10-12T15:00:00Z"),
            locationName: "Room 1",
            locationUrl: "https://use.mazemap.com/#v=1&campusid=1&sharepoitype=poi&sharepoi=1",
          },
        ],
      })
    })
  }

  const submission: CommitteeApplicationSubmit = {
    applicationPeriodId: applicationPeriod.id,
    aboutMe: "I would like to join",
    studyYear: 2,
    groupSelections: applicationGroups.map((group) => {
      return {
        applicationGroupId: group.id,
        rank: group.type === "EXCLUSIVE" ? 1 : null,
      }
    }),
    interviewAvailability: [
      {
        startsAt: new Date("2026-10-12T07:00:00Z"),
        endsAt: new Date("2026-10-12T15:00:00Z"),
      },
    ],
  }

  const application = await dbClient.$transaction(async (handle) => {
    return service.submitApplication(handle, "applicant", submission)
  })

  return {
    applicationPeriod,
    applicationGroups,
    exclusiveGroup,
    application,
    submission,
  }
}

beforeEach(async () => {
  vi.useFakeTimers({
    toFake: ["Date"],
  })

  vi.setSystemTime(openTime)

  await dbClient.user.createMany({
    data: [
      {
        id: "applicant",
        username: "applicant",
        name: "Applicant",
        email: "applicant@example.com",
      },
      {
        id: "other-applicant",
        username: "other-applicant",
        name: null,
      },
      {
        id: "interviewer",
        username: "interviewer",
        name: "Interviewer",
      },
    ],
  })

  await dbClient.group.createMany({
    data: [
      {
        slug: "dotkom",
        abbreviation: "Dotkom",
        description: "Developers",
        type: "COMMITTEE",
      },
      {
        slug: "backlog",
        abbreviation: "Backlog",
        description: "Other group",
        type: "ASSOCIATED",
      },
    ],
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe("committee application persistence", () => {
  it("removes and re-adds participating groups without changing retained groups or duplicating them", async () => {
    const fixture = await createApplicationFixture()
    const originalAdditiveGroup = fixture.applicationGroups.find((group) => group.type === "ADDITIVE")

    await dbClient.committeeApplication.delete({
      where: {
        id: fixture.application.id,
      },
    })

    await dbClient.$transaction(async (handle) => {
      return service.updatePeriod(handle, fixture.applicationPeriod.id, {
        applicationPeriod: {},
        groups: [fixture.exclusiveGroup],
      })
    })

    await dbClient.$transaction(async (handle) => {
      return service.updatePeriod(handle, fixture.applicationPeriod.id, {
        applicationPeriod: {},
        groups: [
          fixture.exclusiveGroup,
          {
            groupId: "backlog",
            type: "ADDITIVE",
            interviewDuration: "MINUTES_20",
          },
        ],
      })
    })

    const statuses = await service.findManyGroupsByPeriodId(dbClient, fixture.applicationPeriod.id)
    const readdedGroup = statuses.find((group) => group.groupId === "backlog")

    expect(statuses).toHaveLength(2)
    expect(readdedGroup).toMatchObject({
      interviewDuration: "MINUTES_20",
      interviewBlockCount: 0,
      interviewBlocksUpdatedAt: null,
      interviewMinutes: 0,
      hasAllValidRooms: false,
    })
    expect(readdedGroup?.id).not.toBe(originalAdditiveGroup?.id)
    expect(statuses.find((group) => group.groupId === "dotkom")).toMatchObject({
      id: fixture.exclusiveGroup.id,
      interviewBlockCount: 1,
      interviewMinutes: 480,
      hasAllValidRooms: true,
    })
  })

  it("round-trips submissions and replaces selections and availability when editing", async () => {
    const fixture = await createApplicationFixture()
    const otherApplication = await dbClient.$transaction(async (handle) => {
      return service.submitApplication(handle, "other-applicant", fixture.submission)
    })

    const previousSelectionIds = fixture.application.groupSelections.map((selection) => selection.id)
    const previousAvailabilityIds = fixture.application.availabilityBlocks.map((availability) => availability.id)
    const updatedAvailability = {
      startsAt: new Date("2026-10-13T08:00:00Z"),
      endsAt: new Date("2026-10-13T10:00:00Z"),
    }

    const updated = await dbClient.$transaction(async (handle) => {
      return service.updateApplication(handle, "applicant", fixture.application.id, {
        aboutMe: "Updated motivation",
        studyYear: 3,
        groupSelections: [
          {
            applicationGroupId: fixture.exclusiveGroup.id,
            rank: 1,
          },
        ],
        interviewAvailability: [updatedAvailability],
      })
    })

    expect(updated).toMatchObject({
      id: fixture.application.id,
      aboutMe: "Updated motivation",
      studyYear: 3,
      groupSelections: [
        {
          applicationGroupId: fixture.exclusiveGroup.id,
          rank: 1,
        },
      ],
      availabilityBlocks: [updatedAvailability],
    })

    const previousSelections = await dbClient.committeeApplicationGroupSelection.count({
      where: {
        id: {
          in: previousSelectionIds,
        },
      },
    })
    const previousAvailability = await dbClient.committeeApplicationAvailability.count({
      where: {
        id: {
          in: previousAvailabilityIds,
        },
      },
    })

    expect(previousSelections).toBe(0)
    expect(previousAvailability).toBe(0)

    await expect(service.getApplicationById(dbClient, otherApplication.id)).resolves.toEqual(otherApplication)

    await expect(
      repository.findApplicationByUserAndPeriod(dbClient, "applicant", fixture.applicationPeriod.id)
    ).resolves.toEqual(updated)
    await expect(service.getApplicationById(dbClient, updated.id)).resolves.toEqual(updated)
    await expect(
      service.findManyApplicationsByPeriodId(dbClient, fixture.applicationPeriod.id, { take: 20 })
    ).resolves.toEqual(expect.arrayContaining([updated, otherApplication]))
  })

  it("serializes concurrent submission retries without duplicating child rows", async () => {
    const fixture = await createApplicationFixture()

    const applications = await Promise.all(
      Array.from({ length: 4 }, () => {
        return dbClient.$transaction(async (handle) => {
          return service.submitApplication(handle, "other-applicant", fixture.submission)
        })
      })
    )

    expect(new Set(applications.map((application) => application.id)).size).toBe(1)

    const persisted = await service.getApplicationById(dbClient, applications[0].id)

    expect(persisted.groupSelections).toHaveLength(2)
    expect(persisted.availabilityBlocks).toHaveLength(1)

    const applicationCount = await dbClient.committeeApplication.count({
      where: {
        userId: "other-applicant",
        applicationPeriodId: fixture.applicationPeriod.id,
      },
    })

    expect(applicationCount).toBe(1)
  })

  it("rejects cross-period selections and rolls back the partially created application", async () => {
    const original = await createApplicationFixture()
    const other = await createApplicationFixture()

    const submission = dbClient.$transaction(async (handle) => {
      return repository.submitApplication(handle, "other-applicant", {
        ...original.submission,
        applicationPeriodId: other.applicationPeriod.id,
      })
    })

    await expect(submission).rejects.toMatchObject({
      code: "P2003",
    })

    await expect(
      repository.findApplicationByUserAndPeriod(dbClient, "other-applicant", other.applicationPeriod.id)
    ).resolves.toBeNull()
    await expect(service.getApplicationById(dbClient, original.application.id)).resolves.toEqual(original.application)
  })

  it("filters open and applicant views by publication state and ownership", async () => {
    const fixture = await createApplicationFixture()

    await expect(service.findOpenPeriod(dbClient)).resolves.toMatchObject({
      id: fixture.applicationPeriod.id,
      groups: expect.arrayContaining([
        expect.objectContaining({
          id: fixture.exclusiveGroup.id,
          name: "Dotkom",
        }),
      ]),
    })

    await expect(
      service.findApplicantView(dbClient, "other-applicant", fixture.applicationPeriod.id)
    ).resolves.toBeNull()

    await dbClient.$transaction(async (handle) => {
      return service.updatePeriod(handle, fixture.applicationPeriod.id, {
        applicationPeriod: {
          isDraft: true,
        },
      })
    })

    await expect(service.findOpenPeriod(dbClient)).resolves.toBeNull()
    await expect(service.findApplicantView(dbClient, "applicant", fixture.applicationPeriod.id)).resolves.toBeNull()

    await dbClient.$transaction(async (handle) => {
      return service.updatePeriod(handle, fixture.applicationPeriod.id, {
        applicationPeriod: {
          isDraft: false,
          isEnabled: false,
        },
      })
    })

    await expect(service.findOpenPeriod(dbClient)).resolves.toBeNull()
    await expect(service.findApplicantView(dbClient, "applicant", fixture.applicationPeriod.id)).resolves.toMatchObject(
      {
        id: fixture.application.id,
      }
    )

    await expect(service.findManyPeriods(dbClient, { take: 20 })).resolves.toEqual([
      expect.objectContaining({
        id: fixture.applicationPeriod.id,
      }),
    ])
  })

  it("upserts block edits, removes obsolete blocks, and leaves other committees untouched", async () => {
    const fixture = await createApplicationFixture()
    const originalBlocks = await service.findManyInterviewBlocksByGroupId(dbClient, fixture.exclusiveGroup.id)
    const originalBlock = originalBlocks[0]
    const otherGroup = fixture.applicationGroups.find((group) => group.id !== fixture.exclusiveGroup.id)

    if (otherGroup === undefined) {
      throw new Error("The fixture must include another group")
    }

    const otherBlocks = await service.findManyInterviewBlocksByGroupId(dbClient, otherGroup.id)
    const replacementId = randomUUID()

    await dbClient.$transaction(async (handle) => {
      return service.setInterviewBlocks(handle, fixture.exclusiveGroup.id, {
        interviewDuration: "MINUTES_20",
        interviewBlocks: [
          {
            ...originalBlock,
            locationName: "Updated room",
          },
          {
            ...originalBlock,
            id: replacementId,
            locationName: "New room",
          },
        ],
      })
    })

    const updatedBlocks = await service.findManyInterviewBlocksByGroupId(dbClient, fixture.exclusiveGroup.id)

    expect(updatedBlocks).toHaveLength(2)
    expect(updatedBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: originalBlock.id, locationName: "Updated room" }),
        expect.objectContaining({ id: replacementId, locationName: "New room" }),
      ])
    )

    await dbClient.$transaction(async (handle) => {
      return service.setInterviewBlocks(handle, fixture.exclusiveGroup.id, {
        interviewDuration: "MINUTES_20",
        interviewBlocks: [updatedBlocks.find((block) => block.id === replacementId) ?? originalBlock],
      })
    })

    await expect(repository.findInterviewBlockById(dbClient, originalBlock.id)).resolves.toBeNull()
    await expect(service.findManyInterviewBlocksByGroupId(dbClient, otherGroup.id)).resolves.toEqual(otherBlocks)
    await expect(service.getApplicationGroupById(dbClient, fixture.exclusiveGroup.id)).resolves.toMatchObject({
      interviewDuration: "MINUTES_20",
    })
  })
})

describe("committee application interview lifecycle", () => {
  it("regenerates one period without deleting another period's assignments", async () => {
    const original = await createApplicationFixture()
    const other = await createApplicationFixture()

    vi.setSystemTime(closedTime)

    await dbClient.$transaction(async (handle) => {
      return service.generateInterviews(handle, original.applicationPeriod.id)
    })

    const originalInterviews = await repository.findManyInterviewsByPeriodId(dbClient, original.applicationPeriod.id)

    await dbClient.$transaction(async (handle) => {
      await service.generateInterviews(handle, other.applicationPeriod.id)
      await service.generateInterviews(handle, other.applicationPeriod.id)
    })

    await expect(repository.findManyInterviewsByPeriodId(dbClient, original.applicationPeriod.id)).resolves.toEqual(
      originalInterviews
    )
    await expect(service.getInterviewSchedule(dbClient, other.applicationPeriod.id)).resolves.toMatchObject({
      matchedInterviews: 1,
    })
  })

  it("schedules one applicant manually without creating an assignment for another applicant", async () => {
    const fixture = await createApplicationFixture()
    const otherApplication = await dbClient.$transaction(async (handle) => {
      return service.submitApplication(handle, "other-applicant", fixture.submission)
    })
    const selection = fixture.application.groupSelections.find((candidate) => {
      return candidate.applicationGroupId === fixture.exclusiveGroup.id
    })
    const blocks = await service.findManyInterviewBlocksByGroupId(dbClient, fixture.exclusiveGroup.id)

    if (selection === undefined) {
      throw new Error("The fixture must select the exclusive group")
    }

    vi.setSystemTime(closedTime)

    const interview = await dbClient.$transaction(async (handle) => {
      return service.scheduleInterview(handle, selection.id, {
        interviewBlockId: blocks[0].id,
        startsAt: interviewStartsAt,
        endsAt: interviewEndsAt,
      })
    })

    await expect(service.getInterviewById(dbClient, interview.id)).resolves.toEqual(interview)

    const schedule = await service.getInterviewSchedule(dbClient, fixture.applicationPeriod.id)
    const matched = schedule.groups.flatMap((group) => group.matchedInterviews)
    const unmatched = schedule.groups.flatMap((group) => group.unmatchedApplicants)

    expect(matched.map((assignment) => assignment.applicationId)).toEqual([fixture.application.id])
    expect(unmatched.filter((applicant) => applicant.applicationId === otherApplication.id)).toHaveLength(2)
    expect(unmatched.find((applicant) => applicant.applicationId === otherApplication.id)?.name).toBe("Ukjent søker")
  })

  it("keeps interviewer signups through regeneration, publication, and individual corrections", async () => {
    const fixture = await createApplicationFixture()

    await dbClient.$transaction(async (handle) => {
      return service.setInterviewAttendance(
        handle,
        fixture.application.id,
        fixture.exclusiveGroup.id,
        "interviewer",
        true
      )
    })

    vi.setSystemTime(closedTime)

    const generated = await dbClient.$transaction(async (handle) => {
      return service.generateInterviews(handle, fixture.applicationPeriod.id)
    })
    const initialInterview = generated.groups.flatMap((group) => group.matchedInterviews)[0]

    expect(generated.totalWantedInterviews).toBe(2)
    expect(generated.matchedInterviews).toBe(1)
    expect(initialInterview.attendees).toEqual([{ userId: "interviewer", name: "Interviewer", imageUrl: null }])

    const unpublished = await service.findApplicantView(dbClient, "applicant", fixture.applicationPeriod.id)

    expect(unpublished?.groups.every((group) => group.interview === null)).toBe(true)

    const regenerated = await dbClient.$transaction(async (handle) => {
      return service.generateInterviews(handle, fixture.applicationPeriod.id)
    })
    const regeneratedInterview = regenerated.groups.flatMap((group) => group.matchedInterviews)[0]

    expect(regeneratedInterview.id).not.toBe(initialInterview.id)
    expect(regeneratedInterview.attendees).toEqual(initialInterview.attendees)

    await dbClient.$transaction(async (handle) => {
      return service.confirmInterviews(handle, fixture.applicationPeriod.id)
    })

    const published = await service.findApplicantView(dbClient, "applicant", fixture.applicationPeriod.id)

    expect(published?.groups.filter((group) => group.interview !== null)).toHaveLength(1)
    expect(published?.interviewsPublishedAt).toEqual(closedTime)

    const rescheduled = await dbClient.$transaction(async (handle) => {
      return service.rescheduleInterview(handle, regeneratedInterview.id, {
        interviewBlockId: regeneratedInterview.interviewBlockId,
        startsAt: new Date("2026-10-12T10:00:00Z"),
        endsAt: new Date("2026-10-12T10:30:00Z"),
      })
    })

    await expect(service.getInterviewById(dbClient, rescheduled.id)).resolves.toEqual(rescheduled)

    const details = await service.getApplicantDetailsById(dbClient, fixture.application.id)

    expect(details.name).toBe("Applicant")
    expect(details.groupSelections.find((selection) => selection.groupId === "dotkom")?.interview).toMatchObject({
      startsAt: rescheduled.startsAt,
      attendees: initialInterview.attendees,
    })

    await dbClient.$transaction(async (handle) => {
      return service.cancelInterview(handle, rescheduled.id)
    })

    await expect(service.getInterviewById(dbClient, rescheduled.id)).rejects.toThrow(NotFoundError)
    await expect(service.getPeriodById(dbClient, fixture.applicationPeriod.id)).resolves.toMatchObject({
      interviewsPublishedAt: closedTime,
    })

    await dbClient.$transaction(async (handle) => {
      return service.setInterviewAttendance(
        handle,
        fixture.application.id,
        fixture.exclusiveGroup.id,
        "interviewer",
        false
      )
    })

    expect(await dbClient.committeeApplicationInterviewAttendee.count()).toBe(0)
  })

  it("preserves draft assignments on rename and rolls back a rejected policy change", async () => {
    const fixture = await createApplicationFixture()

    vi.setSystemTime(closedTime)

    await dbClient.$transaction(async (handle) => {
      return service.generateInterviews(handle, fixture.applicationPeriod.id)
    })

    const originalInterviews = await repository.findManyInterviewsByPeriodId(dbClient, fixture.applicationPeriod.id)

    await dbClient.$transaction(async (handle) => {
      return service.updatePeriod(handle, fixture.applicationPeriod.id, {
        applicationPeriod: {
          name: "Renamed period",
        },
        groups: fixture.applicationGroups,
      })
    })

    await expect(repository.findManyInterviewsByPeriodId(dbClient, fixture.applicationPeriod.id)).resolves.toEqual(
      originalInterviews
    )

    const policyChange = dbClient.$transaction(async (handle) => {
      return service.updatePeriod(handle, fixture.applicationPeriod.id, {
        applicationPeriod: {},
        groups: fixture.applicationGroups.map((group) => {
          return {
            ...group,
            type: "ADDITIVE",
          }
        }),
      })
    })

    await expect(policyChange).rejects.toThrow(FailedPreconditionError)
    await expect(repository.findManyInterviewsByPeriodId(dbClient, fixture.applicationPeriod.id)).resolves.toEqual(
      originalInterviews
    )
    await expect(service.getApplicationGroupById(dbClient, fixture.exclusiveGroup.id)).resolves.toMatchObject({
      type: "EXCLUSIVE",
    })
  })

  it("clears drafts and can revert publication without removing applicants or interviewer signups", async () => {
    const fixture = await createApplicationFixture()

    await dbClient.$transaction(async (handle) => {
      return service.setInterviewAttendance(
        handle,
        fixture.application.id,
        fixture.exclusiveGroup.id,
        "interviewer",
        true
      )
    })

    vi.setSystemTime(closedTime)

    await dbClient.$transaction(async (handle) => {
      await service.generateInterviews(handle, fixture.applicationPeriod.id)
      await service.clearInterviews(handle, fixture.applicationPeriod.id)
    })

    expect(await dbClient.committeeApplicationInterview.count()).toBe(0)
    expect(await dbClient.committeeApplicationInterviewAttendee.count()).toBe(1)

    await dbClient.$transaction(async (handle) => {
      await service.generateInterviews(handle, fixture.applicationPeriod.id)
      await service.confirmInterviews(handle, fixture.applicationPeriod.id)
      await service.revertInterviewPublicationAndMatching(handle, fixture.applicationPeriod.id)
    })

    await expect(service.getInterviewSchedule(dbClient, fixture.applicationPeriod.id)).resolves.toMatchObject({
      totalWantedInterviews: 2,
      matchedInterviews: 0,
      interviewsPublishedAt: null,
    })

    expect(await dbClient.committeeApplicationInterviewAttendee.count()).toBe(1)
    await expect(service.getApplicationById(dbClient, fixture.application.id)).resolves.toEqual(fixture.application)
  })

  it("deletes an entire period in dependency order without touching another period", async () => {
    const original = await createApplicationFixture()
    const survivor = await createApplicationFixture()

    await dbClient.$transaction(async (handle) => {
      return service.setInterviewAttendance(
        handle,
        original.application.id,
        original.exclusiveGroup.id,
        "interviewer",
        true
      )
    })

    vi.setSystemTime(closedTime)

    await dbClient.$transaction(async (handle) => {
      await service.generateInterviews(handle, original.applicationPeriod.id)
      await service.deletePeriod(handle, original.applicationPeriod.id)
    })

    await expect(service.getPeriodById(dbClient, original.applicationPeriod.id)).rejects.toThrow(NotFoundError)
    await expect(service.getApplicationById(dbClient, original.application.id)).rejects.toThrow(NotFoundError)
    await expect(service.getApplicationGroupById(dbClient, original.exclusiveGroup.id)).rejects.toThrow(NotFoundError)
    await expect(service.getApplicantDetailsById(dbClient, original.application.id)).rejects.toThrow(NotFoundError)

    await expect(
      dbClient.$transaction(async (handle) => {
        return service.setInterviewAttendance(
          handle,
          original.application.id,
          original.exclusiveGroup.id,
          "interviewer",
          true
        )
      })
    ).rejects.toThrow(NotFoundError)

    expect(await dbClient.committeeApplicationInterview.count()).toBe(0)
    expect(await dbClient.committeeApplicationInterviewAttendee.count()).toBe(0)

    await expect(service.getApplicationById(dbClient, survivor.application.id)).resolves.toEqual(survivor.application)
    expect(await dbClient.group.count()).toBe(2)
    expect(await dbClient.user.count()).toBe(3)
  })
})
