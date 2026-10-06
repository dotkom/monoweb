import type { DBHandle } from "@dotkomonline/db"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { FailedPreconditionError, IllegalStateError, InvalidArgumentError, NotFoundError } from "../../error"
import type {
  CommitteeApplication,
  CommitteeApplicationGroupOverview,
  CommitteeApplicationInterview,
  CommitteeApplicationInterviewMatchingInput,
  CommitteeApplicationPeriod,
  CommitteeApplicationSubmit,
} from "./committee-application"
import type { CommitteeApplicationRepository } from "./committee-application-repository"
import { getCommitteeApplicationService } from "./committee-application-service"

const openTime = new Date("2026-10-06T12:00:00Z")
const closedTime = new Date("2026-10-11T23:00:00Z")
const period: CommitteeApplicationPeriod = {
  id: "period",
  name: "Komitéopptak",
  createdAt: openTime,
  updatedAt: openTime,
  isDraft: false,
  isEnabled: true,
  applicationsOpenAt: new Date("2026-10-01T12:00:00Z"),
  applicationsCloseAt: new Date("2026-10-11T20:00:00Z"),
  interviewsStartDate: new Date("2026-10-12"),
  interviewsEndDate: new Date("2026-10-15"),
  interviewsPublishedAt: null,
}
const groups: CommitteeApplicationGroupOverview[] = [
  {
    id: "exclusive",
    groupId: "dotkom",
    applicationPeriodId: period.id,
    createdAt: openTime,
    updatedAt: openTime,
    type: "EXCLUSIVE",
    interviewDuration: "MINUTES_30",
    interviewBlockCount: 1,
    interviewBlocksUpdatedAt: openTime,
    hasAllValidRooms: true,
  },
  {
    id: "additive",
    groupId: "backlog",
    applicationPeriodId: period.id,
    createdAt: openTime,
    updatedAt: openTime,
    type: "ADDITIVE",
    interviewDuration: "MINUTES_30",
    interviewBlockCount: 1,
    interviewBlocksUpdatedAt: openTime,
    hasAllValidRooms: true,
  },
]
const submission: CommitteeApplicationSubmit = {
  applicationPeriodId: period.id,
  aboutMe: "I would like to join",
  studyYear: 2,
  groupSelections: [
    { applicationGroupId: "exclusive", rank: 1 },
    { applicationGroupId: "additive", rank: null },
  ],
  interviewAvailability: [{ startsAt: new Date("2026-10-12T07:00:00Z"), endsAt: new Date("2026-10-12T15:00:00Z") }],
}
const application: CommitteeApplication = {
  id: "application",
  createdAt: openTime,
  updatedAt: openTime,
  userId: "user",
  applicationPeriodId: period.id,
  aboutMe: submission.aboutMe,
  studyYear: submission.studyYear,
  groupSelections: submission.groupSelections.map((selection, selectionIndex) => ({
    ...selection,
    id: `selection-${selectionIndex}`,
    applicationId: "application",
    applicationPeriodId: period.id,
    createdAt: openTime,
    updatedAt: openTime,
  })),
  availabilityBlocks: [
    {
      ...submission.interviewAvailability[0],
      id: "availability",
      applicationId: "application",
      createdAt: openTime,
      updatedAt: openTime,
    },
  ],
}
const input: CommitteeApplicationInterviewMatchingInput = {
  publicationReferenceTime: closedTime,
  applications: [{ id: application.id }],
  groups,
  groupSelections: application.groupSelections,
  availabilityBlocks: application.availabilityBlocks,
  interviewBlocks: groups.map((group) => ({
    id: `block-${group.id}`,
    applicationGroupId: group.id,
    startsAt: new Date("2026-10-12T07:00:00Z"),
    endsAt: new Date("2026-10-12T15:00:00Z"),
    locationName: "Room",
  })),
}
const interview: CommitteeApplicationInterview = {
  id: "interview",
  createdAt: closedTime,
  updatedAt: closedTime,
  groupSelectionId: "selection-0",
  applicationGroupId: "exclusive",
  interviewBlockId: "block-exclusive",
  startsAt: new Date("2026-10-12T10:00:00Z"),
  endsAt: new Date("2026-10-12T10:30:00Z"),
}
const placement = {
  interviewBlockId: interview.interviewBlockId,
  startsAt: interview.startsAt,
  endsAt: interview.endsAt,
}
const handle = mockDeep<DBHandle>()

function setup() {
  const repository = mockDeep<CommitteeApplicationRepository>()
  repository.findPeriodById.mockResolvedValue(period)
  repository.findManyGroupsByPeriodId.mockResolvedValue(groups)
  repository.findApplicationByUserAndPeriod.mockResolvedValue(null)
  repository.findApplicationById.mockResolvedValue(application)
  repository.submitApplication.mockResolvedValue(application)
  repository.updateApplication.mockResolvedValue(application)
  repository.findInterviewMatchingInput.mockResolvedValue(input)
  repository.findManyInterviewsByPeriodId.mockResolvedValue([])
  repository.findManyGroupSchedulesByPeriodId.mockResolvedValue([])
  repository.findGroupSelectionById.mockResolvedValue(application.groupSelections[0])
  repository.findInterviewById.mockResolvedValue(interview)
  repository.findApplicationGroupById.mockResolvedValue(groups[0])
  repository.findInterviewBlockById.mockResolvedValue(null)
  repository.countGroupSelections.mockResolvedValue(0)
  repository.createInterview.mockResolvedValue(interview)
  repository.updateInterview.mockResolvedValue(interview)
  const matcher = vi.fn().mockResolvedValue({ interviews: [interview] })
  return { repository, matcher, service: getCommitteeApplicationService(repository, matcher) }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(openTime)
})
afterEach(() => {
  vi.useRealTimers()
})

describe("applications", () => {
  it("submits ranked exclusive and unranked additive selections", async () => {
    const { service, repository } = setup()
    await expect(service.submitApplication(handle, "user", submission)).resolves.toEqual(application)
    expect(repository.submitApplication).toHaveBeenCalledWith(handle, "user", submission)
  })
  it("returns the existing application for a retried submission, including after the deadline", async () => {
    vi.setSystemTime(closedTime)
    const { service, repository } = setup()
    repository.findApplicationByUserAndPeriod.mockResolvedValue(application)
    await expect(service.submitApplication(handle, "user", submission)).resolves.toEqual(application)
    expect(repository.submitApplication).not.toHaveBeenCalled()
  })
  it("updates the owner's submitted application before the deadline", async () => {
    const { service, repository } = setup()
    const update = { ...submission, aboutMe: "Updated application" }
    await service.updateApplication(handle, "user", application.id, update)
    expect(repository.updateApplication).toHaveBeenCalledWith(
      handle,
      application.id,
      expect.objectContaining({ aboutMe: update.aboutMe })
    )
  })
  it("rejects another user's update", async () => {
    const { service, repository } = setup()
    await expect(service.updateApplication(handle, "another-user", application.id, submission)).rejects.toThrow(
      NotFoundError
    )
    expect(repository.updateApplication).not.toHaveBeenCalled()
  })
  it.each(["submit", "update"])("rejects %s exactly at the deadline", async (action) => {
    vi.setSystemTime(period.applicationsCloseAt)
    const { service, repository } = setup()
    let operation: Promise<CommitteeApplication>
    if (action === "update") {
      operation = service.updateApplication(handle, "user", application.id, submission)
    } else {
      operation = service.submitApplication(handle, "user", submission)
    }
    await expect(operation).rejects.toThrow(FailedPreconditionError)
    expect(repository.submitApplication).not.toHaveBeenCalled()
    expect(repository.updateApplication).not.toHaveBeenCalled()
  })
  it.each([
    [{ applicationGroupId: "exclusive", rank: null }],
    [{ applicationGroupId: "additive", rank: 1 }],
    [{ applicationGroupId: "exclusive", rank: 2 }],
    [{ applicationGroupId: "missing", rank: 1 }],
    [
      { applicationGroupId: "exclusive", rank: 1 },
      { applicationGroupId: "exclusive", rank: 2 },
    ],
  ])("rejects invalid selection policies and ranks: %j", async (...selections) => {
    const { service, repository } = setup()
    await expect(
      service.submitApplication(handle, "user", { ...submission, groupSelections: selections })
    ).rejects.toThrow(InvalidArgumentError)
    expect(repository.submitApplication).not.toHaveBeenCalled()
  })
  it("rejects more than three exclusive selections", async () => {
    const { service, repository } = setup()
    repository.findManyGroupsByPeriodId.mockResolvedValue(
      Array.from({ length: 4 }, (_, groupIndex) => ({ ...groups[0], id: `exclusive-${groupIndex}` }))
    )
    await expect(
      service.submitApplication(handle, "user", {
        ...submission,
        groupSelections: Array.from({ length: 4 }, (_, groupIndex) => ({
          applicationGroupId: `exclusive-${groupIndex}`,
          rank: groupIndex + 1,
        })),
      })
    ).rejects.toThrow(InvalidArgumentError)
  })
  it("rejects availability outside the period's interview hours", async () => {
    const { service } = setup()
    await expect(
      service.submitApplication(handle, "user", {
        ...submission,
        interviewAvailability: [
          { startsAt: new Date("2026-10-12T06:00:00Z"), endsAt: new Date("2026-10-12T08:00:00Z") },
        ],
      })
    ).rejects.toThrow(InvalidArgumentError)
  })
  it.each([
    { isDraft: true },
    { isEnabled: false },
    { interviewsPublishedAt: openTime },
  ])("rejects application changes for an unavailable period: %j", async (state) => {
    const { service, repository } = setup()
    repository.findPeriodById.mockResolvedValue({ ...period, ...state })
    await expect(service.updateApplication(handle, "user", application.id, submission)).rejects.toThrow(
      FailedPreconditionError
    )
  })
})

describe("period configuration", () => {
  it("creates the period and typed participating groups in one action", async () => {
    const { service, repository } = setup()
    repository.createPeriod.mockResolvedValue(period)
    await service.createPeriod(handle, { applicationPeriod: period, groups })
    expect(repository.createGroups).toHaveBeenCalledWith(
      handle,
      period.id,
      groups.map((group) => ({ groupId: group.groupId, type: group.type, interviewDuration: group.interviewDuration }))
    )
  })
  it("updates existing group duration and clears the stale draft schedule", async () => {
    const { service, repository } = setup()
    await service.updatePeriod(handle, period.id, {
      applicationPeriod: {},
      groups: groups.map((group) => ({ groupId: group.groupId, type: group.type, interviewDuration: "MINUTES_20" })),
    })
    expect(repository.updateGroup).toHaveBeenCalledWith(
      handle,
      groups[0].id,
      expect.objectContaining({ interviewDuration: "MINUTES_20" })
    )
    expect(repository.replaceInterviews).toHaveBeenCalledWith(handle, period.id, [])
  })
  it("prevents removing a group that already has applicants", async () => {
    const { service, repository } = setup()
    repository.countGroupSelections.mockResolvedValue(1)
    await expect(
      service.updatePeriod(handle, period.id, { applicationPeriod: {}, groups: [groups[1]] })
    ).rejects.toThrow(FailedPreconditionError)
    expect(repository.deleteGroups).not.toHaveBeenCalled()
  })
  it("accepts a single interview day and rejects reversed application dates", async () => {
    const { service, repository } = setup()
    repository.createPeriod.mockResolvedValue(period)
    await service.createPeriod(handle, {
      applicationPeriod: { ...period, interviewsEndDate: period.interviewsStartDate },
      groups,
    })
    await expect(
      service.createPeriod(handle, {
        applicationPeriod: { ...period, applicationsOpenAt: period.applicationsCloseAt },
        groups,
      })
    ).rejects.toThrow(InvalidArgumentError)
  })
})

describe("interview publication", () => {
  beforeEach(() => {
    vi.setSystemTime(closedTime)
  })
  it("generates an unpublished schedule using the current publication reference", async () => {
    const { service, repository, matcher } = setup()
    await service.generateInterviews(handle, period.id)
    expect(repository.findInterviewMatchingInput).toHaveBeenCalledWith(handle, period.id, closedTime)
    expect(matcher).toHaveBeenCalledWith(input)
    expect(repository.replaceInterviews).toHaveBeenCalledWith(handle, period.id, [interview])
    expect(repository.publishInterviews).not.toHaveBeenCalled()
  })
  it("prevents matching while applicants can still edit", async () => {
    vi.setSystemTime(openTime)
    const { service, matcher } = setup()
    await expect(service.generateInterviews(handle, period.id)).rejects.toThrow(FailedPreconditionError)
    expect(matcher).not.toHaveBeenCalled()
  })
  it("confirms the existing schedule and publishes immediately", async () => {
    const { service, repository } = setup()
    repository.findManyInterviewsByPeriodId.mockResolvedValue([interview])
    repository.publishInterviews.mockResolvedValue({ ...period, interviewsPublishedAt: closedTime })
    await expect(service.confirmInterviews(handle, period.id)).resolves.toMatchObject({
      interviewsPublishedAt: closedTime,
    })
    expect(repository.publishInterviews).toHaveBeenCalledWith(handle, period.id, closedTime)
  })
  it("does not publish an empty schedule", async () => {
    const { service, repository } = setup()
    await expect(service.confirmInterviews(handle, period.id)).rejects.toThrow(IllegalStateError)
    expect(repository.publishInterviews).not.toHaveBeenCalled()
  })
  it("keeps the original publication time on repeated confirmation", async () => {
    const { service, repository } = setup()
    repository.findPeriodById.mockResolvedValue({ ...period, interviewsPublishedAt: openTime })
    await expect(service.confirmInterviews(handle, period.id)).resolves.toMatchObject({
      interviewsPublishedAt: openTime,
    })
    expect(repository.publishInterviews).not.toHaveBeenCalled()
  })
  it.each(["generate", "clear", "configuration", "blocks"])("prevents bulk %s after publication", async (action) => {
    const { service, repository } = setup()
    repository.findPeriodById.mockResolvedValue({ ...period, interviewsPublishedAt: closedTime })
    let operation: Promise<unknown>
    if (action === "generate") {
      operation = service.generateInterviews(handle, period.id)
    } else if (action === "clear") {
      operation = service.clearInterviews(handle, period.id)
    } else if (action === "configuration") {
      operation = service.updatePeriod(handle, period.id, { applicationPeriod: { isDraft: true } })
    } else {
      operation = service.setInterviewBlocks(handle, groups[0].id, {
        interviewDuration: "MINUTES_30",
        interviewBlocks: [],
      })
    }
    await expect(operation).rejects.toThrow(IllegalStateError)
    expect(repository.replaceInterviews).not.toHaveBeenCalled()
  })
})

describe("individual interview corrections", () => {
  beforeEach(() => {
    vi.setSystemTime(closedTime)
  })
  it("reschedules one published interview without changing publication or other interviews", async () => {
    const { service, repository } = setup()
    repository.findPeriodById.mockResolvedValue({ ...period, interviewsPublishedAt: closedTime })
    repository.findManyInterviewsByPeriodId.mockResolvedValue([interview])
    await service.rescheduleInterview(handle, interview.id, {
      ...placement,
      startsAt: new Date("2026-10-12T11:00:00Z"),
      endsAt: new Date("2026-10-12T11:30:00Z"),
    })
    expect(repository.updateInterview).toHaveBeenCalledWith(
      handle,
      interview.id,
      expect.objectContaining({ startsAt: new Date("2026-10-12T11:00:00Z") })
    )
    expect(repository.replaceInterviews).not.toHaveBeenCalled()
    expect(repository.publishInterviews).not.toHaveBeenCalled()
  })
  it("cancels one published interview without unpublishing", async () => {
    const { service, repository } = setup()
    repository.findPeriodById.mockResolvedValue({ ...period, interviewsPublishedAt: closedTime })
    await service.cancelInterview(handle, interview.id)
    expect(repository.deleteInterview).toHaveBeenCalledWith(handle, interview.id)
    expect(repository.publishInterviews).not.toHaveBeenCalled()
  })
  it("rejects an interview block owned by another committee", async () => {
    const { service, repository } = setup()
    await expect(
      service.scheduleInterview(handle, "selection-0", { ...placement, interviewBlockId: "block-additive" })
    ).rejects.toThrow(InvalidArgumentError)
    expect(repository.createInterview).not.toHaveBeenCalled()
  })
  it("rejects an incorrect duration", async () => {
    const { service } = setup()
    await expect(
      service.scheduleInterview(handle, "selection-0", { ...placement, endsAt: new Date("2026-10-12T10:20:00Z") })
    ).rejects.toThrow(InvalidArgumentError)
  })
  it("rejects a second interview for the same selection", async () => {
    const { service, repository } = setup()
    repository.findManyInterviewsByPeriodId.mockResolvedValue([interview])
    await expect(service.scheduleInterview(handle, "selection-0", placement)).rejects.toThrow(InvalidArgumentError)
  })
  it("rejects insufficient travel time between an applicant's interviews", async () => {
    const { service, repository } = setup()
    repository.findManyInterviewsByPeriodId.mockResolvedValue([
      {
        ...interview,
        groupSelectionId: "selection-1",
        applicationGroupId: "additive",
        interviewBlockId: "block-additive",
        startsAt: new Date("2026-10-12T09:30:00Z"),
        endsAt: new Date("2026-10-12T10:00:00Z"),
      },
    ])
    await expect(service.scheduleInterview(handle, "selection-0", placement)).rejects.toThrow(InvalidArgumentError)
  })
  it("merges touching availability before validating a correction", async () => {
    const { service, repository } = setup()
    repository.findInterviewMatchingInput.mockResolvedValue({
      ...input,
      availabilityBlocks: [
        {
          applicationId: application.id,
          startsAt: new Date("2026-10-12T10:00:00Z"),
          endsAt: new Date("2026-10-12T10:15:00Z"),
        },
        {
          applicationId: application.id,
          startsAt: new Date("2026-10-12T10:15:00Z"),
          endsAt: new Date("2026-10-12T10:30:00Z"),
        },
      ],
    })
    await expect(service.scheduleInterview(handle, "selection-0", placement)).resolves.toEqual(interview)
  })
  it("rejects room double booking by different applicants", async () => {
    const { service, repository } = setup()
    repository.findInterviewMatchingInput.mockResolvedValue({
      ...input,
      groupSelections: [
        ...input.groupSelections,
        { id: "other-selection", applicationId: "other-application", applicationGroupId: "exclusive" },
      ],
    })
    repository.findManyInterviewsByPeriodId.mockResolvedValue([{ ...interview, groupSelectionId: "other-selection" }])
    await expect(service.scheduleInterview(handle, "selection-0", placement)).rejects.toThrow(InvalidArgumentError)
  })
  it("rejects availability with a gap", async () => {
    const { service, repository } = setup()
    repository.findInterviewMatchingInput.mockResolvedValue({
      ...input,
      availabilityBlocks: [
        {
          applicationId: application.id,
          startsAt: new Date("2026-10-12T10:00:00Z"),
          endsAt: new Date("2026-10-12T10:10:00Z"),
        },
        {
          applicationId: application.id,
          startsAt: new Date("2026-10-12T10:20:00Z"),
          endsAt: new Date("2026-10-12T10:30:00Z"),
        },
      ],
    })
    await expect(service.scheduleInterview(handle, "selection-0", placement)).rejects.toThrow(InvalidArgumentError)
  })
})
