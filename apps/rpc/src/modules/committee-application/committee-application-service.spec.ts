import type { DBHandle } from "@dotkomonline/db"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { FailedPreconditionError, IllegalStateError, InvalidArgumentError, NotFoundError } from "../../error"
import type {
  CommitteeApplication,
  CommitteeApplicationGroupStatus,
  CommitteeApplicationInterview,
  CommitteeApplicationInterviewMatchingInput,
  CommitteeApplicationPeriod,
  CommitteeApplicationPeriodUpdate,
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
  interviewsStartDate: new Date("2026-10-12T07:00:00Z"),
  interviewsEndDate: new Date("2026-10-15T15:00:00Z"),
  interviewsPublishedAt: null,
  interviewsStartTime: "09:00",
  interviewsEndTime: "17:00",
}
const groups: CommitteeApplicationGroupStatus[] = [
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
    interviewMinutes: 480,
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
    interviewMinutes: 480,
  },
]
const submission: CommitteeApplicationSubmit = {
  applicationPeriodId: period.id,
  aboutMe: "I would like to join",
  studyYear: 2,
  groupSelections: [
    {
      applicationGroupId: "exclusive",
      rank: 1,
    },
    {
      applicationGroupId: "additive",
      rank: null,
    },
  ],
  interviewAvailability: [
    {
      startsAt: new Date("2026-10-12T07:00:00Z"),
      endsAt: new Date("2026-10-12T15:00:00Z"),
    },
  ],
}
const application: CommitteeApplication = {
  id: "application",
  createdAt: openTime,
  updatedAt: openTime,
  userId: "user",
  applicationPeriodId: period.id,
  aboutMe: submission.aboutMe,
  studyYear: submission.studyYear,
  groupSelections: submission.groupSelections.map((selection, selectionIndex) => {
    return {
      ...selection,
      id: `selection-${selectionIndex}`,
      applicationId: "application",
      applicationPeriodId: period.id,
      createdAt: openTime,
      updatedAt: openTime,
    }
  }),
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
  applications: [
    {
      id: application.id,
    },
  ],
  groups,
  groupSelections: application.groupSelections,
  availabilityBlocks: application.availabilityBlocks,
  interviewBlocks: groups.map((group) => {
    return {
      id: `block-${group.id}`,
      applicationGroupId: group.id,
      startsAt: new Date("2026-10-12T07:00:00Z"),
      endsAt: new Date("2026-10-12T15:00:00Z"),
      locationName: "Room",
    }
  }),
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

  repository.findManyGroupMatchingsByPeriodId.mockResolvedValue([])

  repository.findGroupSelectionById.mockResolvedValue(application.groupSelections[0])

  repository.findInterviewById.mockResolvedValue(interview)

  repository.findApplicationGroupById.mockResolvedValue(groups[0])

  repository.findInterviewBlockById.mockResolvedValue(null)

  repository.countGroupSelections.mockResolvedValue(0)

  repository.createInterview.mockResolvedValue(interview)

  repository.updateInterview.mockResolvedValue(interview)

  const matcher = vi.fn().mockResolvedValue({
    interviews: [interview],
  })

  return {
    repository,
    matcher,
    service: getCommitteeApplicationService(repository, matcher),
  }
}

beforeEach(() => {
  vi.useFakeTimers()

  vi.setSystemTime(openTime)
})

afterEach(() => {
  vi.useRealTimers()
})

describe("applications", () => {
  it("accepts exactly three contiguous exclusive choices", async () => {
    const { service, repository } = setup()
    const exclusiveGroups = Array.from({ length: 3 }, (_, groupIndex) => {
      return {
        ...groups[0],
        id: `exclusive-${groupIndex}`,
      }
    })

    repository.findManyGroupsByPeriodId.mockResolvedValue(exclusiveGroups)

    await expect(
      service.submitApplication(handle, "user", {
        ...submission,
        groupSelections: exclusiveGroups.map((group, groupIndex) => {
          return {
            applicationGroupId: group.id,
            rank: groupIndex + 1,
          }
        }),
      })
    ).resolves.toEqual(application)
  })

  it("rejects submissions before opening and accepts the opening instant", async () => {
    const { service, repository } = setup()

    vi.setSystemTime(new Date(period.applicationsOpenAt.getTime() - 1))

    await expect(service.submitApplication(handle, "user", submission)).rejects.toThrow(FailedPreconditionError)

    expect(repository.submitApplication).not.toHaveBeenCalled()

    vi.setSystemTime(period.applicationsOpenAt)

    await expect(service.submitApplication(handle, "user", submission)).resolves.toEqual(application)
  })

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
    const update = {
      ...submission,
      aboutMe: "Updated application",
    }

    await service.updateApplication(handle, "user", application.id, update)

    expect(repository.updateApplication).toHaveBeenCalledWith(
      handle,
      application.id,
      expect.objectContaining({
        aboutMe: update.aboutMe,
      })
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
    [
      {
        applicationGroupId: "exclusive",
        rank: null,
      },
    ],
    [
      {
        applicationGroupId: "additive",
        rank: 1,
      },
    ],
    [
      {
        applicationGroupId: "exclusive",
        rank: 2,
      },
    ],
    [
      {
        applicationGroupId: "missing",
        rank: 1,
      },
    ],
    [
      {
        applicationGroupId: "exclusive",
        rank: 1,
      },
      {
        applicationGroupId: "exclusive",
        rank: 2,
      },
    ],
  ])("rejects invalid selection policies and ranks: %j", async (...selections) => {
    const { service, repository } = setup()

    await expect(
      service.submitApplication(handle, "user", {
        ...submission,
        groupSelections: selections,
      })
    ).rejects.toThrow(InvalidArgumentError)

    expect(repository.submitApplication).not.toHaveBeenCalled()
  })

  it("rejects more than three exclusive selections", async () => {
    const { service, repository } = setup()

    repository.findManyGroupsByPeriodId.mockResolvedValue(
      Array.from(
        {
          length: 4,
        },
        (_, groupIndex) => {
          return {
            ...groups[0],
            id: `exclusive-${groupIndex}`,
          }
        }
      )
    )

    await expect(
      service.submitApplication(handle, "user", {
        ...submission,
        groupSelections: Array.from(
          {
            length: 4,
          },
          (_, groupIndex) => {
            return {
              applicationGroupId: `exclusive-${groupIndex}`,
              rank: groupIndex + 1,
            }
          }
        ),
      })
    ).rejects.toThrow(InvalidArgumentError)
  })

  it("rejects availability outside the period's interview hours", async () => {
    const { service } = setup()

    await expect(
      service.submitApplication(handle, "user", {
        ...submission,
        interviewAvailability: [
          {
            startsAt: new Date("2026-10-12T06:00:00Z"),
            endsAt: new Date("2026-10-12T08:00:00Z"),
          },
        ],
      })
    ).rejects.toThrow(InvalidArgumentError)
  })

  it("accepts configured evening hours and rejects intervals beyond them", async () => {
    const { service, repository } = setup()

    repository.findPeriodById.mockResolvedValue({
      ...period,
      interviewsStartTime: "18:00",
      interviewsEndTime: "23:30",
    })

    const evening = {
      startsAt: new Date("2026-10-13T16:00:00Z"),
      endsAt: new Date("2026-10-13T21:30:00Z"),
    }

    await expect(
      service.submitApplication(handle, "user", {
        ...submission,
        interviewAvailability: [evening],
      })
    ).resolves.toEqual(application)

    await expect(
      service.submitApplication(handle, "user", {
        ...submission,
        interviewAvailability: [
          {
            ...evening,
            endsAt: new Date("2026-10-13T21:31:00Z"),
          },
        ],
      })
    ).rejects.toThrow(InvalidArgumentError)
  })

  it.each([
    {
      isDraft: true,
    },
    {
      isEnabled: false,
    },
    {
      interviewsPublishedAt: openTime,
    },
  ])("rejects application changes for an unavailable period: %j", async (state) => {
    const { service, repository } = setup()

    repository.findPeriodById.mockResolvedValue({
      ...period,
      ...state,
    })

    await expect(service.updateApplication(handle, "user", application.id, submission)).rejects.toThrow(
      FailedPreconditionError
    )
  })
})

describe("participating group status", () => {
  it("summarizes interview time and distinguishes configured, invalid, and missing rooms", async () => {
    const { service, repository } = setup()
    const interviewBlock = {
      id: "first-block",
      applicationGroupId: groups[0].id,
      createdAt: openTime,
      updatedAt: closedTime,
      startsAt: new Date("2026-10-12T07:00:00Z"),
      endsAt: new Date("2026-10-12T08:00:00Z"),
      locationName: "Room",
      locationUrl: "https://use.mazemap.com/#v=1&campusid=1&sharepoitype=poi&sharepoi=1",
    }

    repository.findManyGroupsWithInterviewBlocksByPeriodId.mockResolvedValue([
      {
        ...groups[0],
        interviewBlocks: [
          interviewBlock,
          {
            ...interviewBlock,
            id: "second-block",
            updatedAt: openTime,
            startsAt: new Date("2026-10-12T08:00:00Z"),
            endsAt: new Date("2026-10-12T08:30:00Z"),
          },
        ],
      },
      {
        ...groups[1],
        interviewBlocks: [
          {
            ...interviewBlock,
            locationUrl: null,
          },
        ],
      },
      {
        ...groups[1],
        id: "unconfigured",
        interviewBlocks: [],
      },
    ])

    const statuses = await service.findManyGroupsByPeriodId(handle, period.id)

    expect(statuses).toMatchObject([
      {
        id: groups[0].id,
        interviewBlockCount: 2,
        interviewBlocksUpdatedAt: closedTime,
        interviewMinutes: 90,
        hasAllValidRooms: true,
      },
      {
        id: groups[1].id,
        interviewBlockCount: 1,
        interviewMinutes: 60,
        hasAllValidRooms: false,
      },
      {
        id: "unconfigured",
        interviewBlockCount: 0,
        interviewBlocksUpdatedAt: null,
        interviewMinutes: 0,
        hasAllValidRooms: false,
      },
    ])
  })
})

describe("period configuration", () => {
  it("rejects duplicate participating groups before creating a period", async () => {
    const { service, repository } = setup()

    await expect(
      service.createPeriod(handle, {
        applicationPeriod: period,
        groups: [groups[0], groups[0]],
      })
    ).rejects.toThrow(InvalidArgumentError)

    expect(repository.createPeriod).not.toHaveBeenCalled()
  })

  it.each([
    {
      interviewsStartDate: new Date("2026-10-16"),
    },
    {
      interviewsStartDate: new Date("2026-10-11"),
    },
  ])("rejects reversed interview days or interviews before applications close: %j", async (configuration) => {
    const { service, repository } = setup()

    await expect(
      service.createPeriod(handle, {
        applicationPeriod: {
          ...period,
          ...configuration,
        },
        groups,
      })
    ).rejects.toThrow(InvalidArgumentError)

    expect(repository.createPeriod).not.toHaveBeenCalled()
  })

  it("rejects narrower hours around applicant availability even when committees have no blocks", async () => {
    const { service, repository } = setup()

    repository.findInterviewMatchingInput.mockResolvedValue({
      ...input,
      interviewBlocks: [],
    })

    await expect(
      service.updatePeriod(handle, period.id, {
        applicationPeriod: {
          interviewsStartTime: "10:00",
        },
      })
    ).rejects.toThrow(FailedPreconditionError)

    expect(repository.replaceInterviews).not.toHaveBeenCalled()
    expect(repository.updatePeriod).not.toHaveBeenCalled()
  })

  it.each<CommitteeApplicationPeriodUpdate>([
    {
      applicationPeriod: {
        name: "New name",
      },
    },
    {
      applicationPeriod: {},
    },
    {
      applicationPeriod: period,
      groups: groups.toReversed(),
    },
  ])("preserves the draft schedule when scheduling inputs are unchanged: %j", async (configuration) => {
    const { service, repository } = setup()

    await service.updatePeriod(handle, period.id, configuration)

    expect(repository.replaceInterviews).not.toHaveBeenCalled()

    expect(repository.findInterviewMatchingInput).not.toHaveBeenCalled()

    expect(repository.updateGroup).not.toHaveBeenCalled()

    expect(repository.updatePeriod).toHaveBeenCalledOnce()
  })

  it.each<CommitteeApplicationPeriodUpdate>([
    {
      applicationPeriod: {
        interviewsEndDate: new Date("2026-10-16T00:00:00Z"),
      },
    },
    {
      applicationPeriod: {
        interviewsStartTime: "08:00",
      },
    },
    {
      applicationPeriod: {
        applicationsCloseAt: new Date("2026-10-11T19:00:00Z"),
      },
    },
    {
      applicationPeriod: {},
      groups: [groups[0]],
    },
    {
      applicationPeriod: {},
      groups: [
        ...groups,
        {
          groupId: "new-group",
          type: "ADDITIVE",
          interviewDuration: "MINUTES_30",
        },
      ],
    },
  ])("clears the draft schedule when scheduling inputs change: %j", async (configuration) => {
    const { service, repository } = setup()

    await service.updatePeriod(handle, period.id, configuration)

    expect(repository.replaceInterviews).toHaveBeenCalledWith(handle, period.id, [])
  })

  it.each(["09:00", "08:59"])("rejects an end time of %s at or before the start", async (interviewsEndTime) => {
    const { service } = setup()

    await expect(
      service.createPeriod(handle, {
        applicationPeriod: {
          ...period,
          interviewsEndTime,
        },
        groups,
      })
    ).rejects.toThrow(InvalidArgumentError)
  })

  it("rejects narrowing the hours around existing interview blocks", async () => {
    const { service, repository } = setup()

    repository.findInterviewMatchingInput.mockResolvedValue({
      ...input,
      availabilityBlocks: [],
    })

    await expect(
      service.updatePeriod(handle, period.id, {
        applicationPeriod: {
          interviewsStartTime: "10:00",
        },
      })
    ).rejects.toThrow(FailedPreconditionError)

    expect(repository.updatePeriod).not.toHaveBeenCalled()
  })

  it("creates the period and typed participating groups in one action", async () => {
    const { service, repository } = setup()

    repository.createPeriod.mockResolvedValue(period)

    await service.createPeriod(handle, {
      applicationPeriod: period,
      groups,
    })

    expect(repository.createGroups).toHaveBeenCalledWith(
      handle,
      period.id,
      groups.map((group) => {
        return {
          groupId: group.groupId,
          type: group.type,
          interviewDuration: group.interviewDuration,
        }
      })
    )
  })

  it("updates existing group duration and clears the stale draft schedule", async () => {
    const { service, repository } = setup()

    await service.updatePeriod(handle, period.id, {
      applicationPeriod: {},
      groups: groups.map((group) => {
        return {
          groupId: group.groupId,
          type: group.type,
          interviewDuration: "MINUTES_20",
        }
      }),
    })

    expect(repository.updateGroup).toHaveBeenCalledWith(
      handle,
      groups[0].id,
      expect.objectContaining({
        interviewDuration: "MINUTES_20",
      })
    )

    expect(repository.replaceInterviews).toHaveBeenCalledWith(handle, period.id, [])
  })

  it("prevents removing a group that already has applicants", async () => {
    const { service, repository } = setup()

    repository.countGroupSelections.mockResolvedValue(1)

    await expect(
      service.updatePeriod(handle, period.id, {
        applicationPeriod: {},
        groups: [groups[1]],
      })
    ).rejects.toThrow(FailedPreconditionError)

    expect(repository.deleteGroups).not.toHaveBeenCalled()
  })

  it("accepts a single interview day and rejects reversed application dates", async () => {
    const { service, repository } = setup()

    repository.createPeriod.mockResolvedValue(period)

    await service.createPeriod(handle, {
      applicationPeriod: {
        ...period,
        interviewsEndDate: new Date("2026-10-12T15:00:00Z"),
      },
      groups,
    })

    await expect(
      service.createPeriod(handle, {
        applicationPeriod: {
          ...period,
          applicationsOpenAt: period.applicationsCloseAt,
        },
        groups,
      })
    ).rejects.toThrow(InvalidArgumentError)
  })
})

describe("interview block configuration", () => {
  const block = {
    ...input.interviewBlocks[0],
    locationUrl: null,
  }

  it.each([
    [new Date(period.applicationsCloseAt.getTime() - 1), true],
    [period.applicationsCloseAt, false],
  ])("locks block edits at the application deadline: %s", async (currentTime, isAccepted) => {
    const { service, repository } = setup()

    vi.setSystemTime(currentTime)

    repository.findManyInterviewBlocksByGroupId.mockResolvedValue([])

    const update = service.setInterviewBlocks(handle, groups[0].id, {
      interviewDuration: "MINUTES_30",
      interviewBlocks: [block],
    })

    if (isAccepted) {
      await expect(update).resolves.toEqual([])
    } else {
      await expect(update).rejects.toThrow(FailedPreconditionError)

      expect(repository.setInterviewBlocks).not.toHaveBeenCalled()
      expect(repository.replaceInterviews).not.toHaveBeenCalled()
    }
  })

  it.each([
    [block, block],
    [{ ...block, startsAt: new Date("2026-10-12T06:59:59Z") }],
  ])("rejects duplicate IDs or out-of-window blocks before replacing saved data: %j", async (...blocks) => {
    const { service, repository } = setup()

    await expect(
      service.setInterviewBlocks(handle, groups[0].id, {
        interviewDuration: "MINUTES_30",
        interviewBlocks: blocks,
      })
    ).rejects.toThrow(InvalidArgumentError)

    expect(repository.setInterviewBlocks).not.toHaveBeenCalled()
    expect(repository.replaceInterviews).not.toHaveBeenCalled()
  })

  it("rejects taking over another committee's block ID", async () => {
    const { service, repository } = setup()

    repository.findInterviewBlockById.mockResolvedValue({
      ...block,
      applicationGroupId: "additive",
      createdAt: openTime,
      updatedAt: openTime,
    })

    await expect(
      service.setInterviewBlocks(handle, groups[0].id, {
        interviewDuration: "MINUTES_30",
        interviewBlocks: [block],
      })
    ).rejects.toThrow(InvalidArgumentError)

    expect(repository.setInterviewBlocks).not.toHaveBeenCalled()
    expect(repository.updateGroup).not.toHaveBeenCalled()
  })
})

describe("interview publication", () => {
  beforeEach(() => {
    vi.setSystemTime(closedTime)
  })

  it("rejects a missing period without deleting its schedule", async () => {
    const { service, repository } = setup()

    repository.findPeriodById.mockResolvedValue(null)

    await expect(service.deletePeriod(handle, "missing-period")).rejects.toThrow(NotFoundError)

    expect(repository.deletePeriod).not.toHaveBeenCalled()
  })

  it("rejects a missing matching input before calling the matcher", async () => {
    const { service, repository, matcher } = setup()

    repository.findInterviewMatchingInput.mockResolvedValue(null)

    await expect(service.generateInterviews(handle, period.id)).rejects.toThrow(NotFoundError)

    expect(matcher).not.toHaveBeenCalled()
    expect(repository.replaceInterviews).not.toHaveBeenCalled()
  })

  it("rejects generation without a configured matcher", async () => {
    const { repository } = setup()
    const service = getCommitteeApplicationService(repository)

    await expect(service.generateInterviews(handle, period.id)).rejects.toThrow(IllegalStateError)

    expect(repository.replaceInterviews).not.toHaveBeenCalled()
  })

  it("rejects an invalid solver proposal without replacing the saved schedule", async () => {
    const { service, repository, matcher } = setup()

    matcher.mockResolvedValue({
      interviews: [
        {
          ...interview,
          interviewBlockId: "block-additive",
        },
      ],
    })

    await expect(service.generateInterviews(handle, period.id)).rejects.toThrow(InvalidArgumentError)

    expect(repository.replaceInterviews).not.toHaveBeenCalled()
  })

  it("generates an unpublished schedule using the current publication reference", async () => {
    const { service, repository, matcher } = setup()

    await service.generateInterviews(handle, period.id)

    expect(repository.findInterviewMatchingInput).toHaveBeenCalledWith(handle, period.id, closedTime)

    expect(matcher).toHaveBeenCalledWith(input)

    expect(repository.replaceInterviews).toHaveBeenCalledWith(handle, period.id, [interview])

    expect(repository.setInterviewsPublishedAt).not.toHaveBeenCalled()
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

    repository.setInterviewsPublishedAt.mockResolvedValue({
      ...period,
      interviewsPublishedAt: closedTime,
    })

    await expect(service.confirmInterviews(handle, period.id)).resolves.toMatchObject({
      interviewsPublishedAt: closedTime,
    })

    expect(repository.setInterviewsPublishedAt).toHaveBeenCalledWith(handle, period.id, closedTime)
  })

  it("does not publish an empty schedule", async () => {
    const { service, repository } = setup()

    await expect(service.confirmInterviews(handle, period.id)).rejects.toThrow(IllegalStateError)

    expect(repository.setInterviewsPublishedAt).not.toHaveBeenCalled()
  })

  it("keeps the original publication time on repeated confirmation", async () => {
    const { service, repository } = setup()

    repository.findPeriodById.mockResolvedValue({
      ...period,
      interviewsPublishedAt: openTime,
    })

    await expect(service.confirmInterviews(handle, period.id)).resolves.toMatchObject({
      interviewsPublishedAt: openTime,
    })

    expect(repository.setInterviewsPublishedAt).not.toHaveBeenCalled()
  })

  it.each(["generate", "clear", "configuration", "blocks"])("prevents bulk %s after publication", async (action) => {
    const { service, repository } = setup()

    repository.findPeriodById.mockResolvedValue({
      ...period,
      interviewsPublishedAt: closedTime,
    })

    let operation: Promise<unknown>

    if (action === "generate") {
      operation = service.generateInterviews(handle, period.id)
    } else if (action === "clear") {
      operation = service.clearInterviews(handle, period.id)
    } else if (action === "configuration") {
      operation = service.updatePeriod(handle, period.id, {
        applicationPeriod: {
          isDraft: true,
        },
      })
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

  it.each([
    ["2026-10-12T09:15:00Z", "2026-10-12T09:45:00Z", true],
    ["2026-10-12T09:15:00.001Z", "2026-10-12T09:45:00.001Z", false],
    ["2026-10-12T10:45:00Z", "2026-10-12T11:15:00Z", true],
    ["2026-10-12T10:44:59.999Z", "2026-10-12T11:14:59.999Z", false],
  ])("requires the full travel buffer before and after an interview: %s", async (startsAt, endsAt, isAccepted) => {
    const { service, repository } = setup()

    repository.findManyInterviewsByPeriodId.mockResolvedValue([
      {
        ...interview,
        groupSelectionId: "selection-1",
        applicationGroupId: "additive",
        interviewBlockId: "block-additive",
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
      },
    ])

    const scheduling = service.scheduleInterview(handle, "selection-0", placement)

    if (isAccepted) {
      await expect(scheduling).resolves.toEqual(interview)
    } else {
      await expect(scheduling).rejects.toThrow(InvalidArgumentError)

      expect(repository.createInterview).not.toHaveBeenCalled()
    }
  })

  it.each([
    ["Room", "2026-10-12T10:00:00Z", "2026-10-12T10:30:00Z", false],
    ["Other room", "2026-10-12T10:00:00Z", "2026-10-12T10:30:00Z", true],
    ["Room", "2026-10-12T09:30:00Z", "2026-10-12T10:00:00Z", true],
    ["Room", "2026-10-12T10:30:00Z", "2026-10-12T11:00:00Z", true],
    ["Room", "2026-10-12T09:45:00Z", "2026-10-12T10:15:00Z", false],
    ["Room", "2026-10-12T10:15:00Z", "2026-10-12T10:45:00Z", false],
  ])("allows parallel rooms and adjoining slots while rejecting same-room overlaps: %s at %s", async (locationName, startsAt, endsAt, isAccepted) => {
    const { service, repository } = setup()
    const otherBlock = {
      ...input.interviewBlocks[0],
      id: "other-block",
      locationName,
    }

    repository.findInterviewMatchingInput.mockResolvedValue({
      ...input,
      interviewBlocks: [...input.interviewBlocks, otherBlock],
      groupSelections: [
        ...input.groupSelections,
        {
          id: "other-selection",
          applicationId: "other-applicant",
          applicationGroupId: "exclusive",
        },
      ],
    })

    repository.findManyInterviewsByPeriodId.mockResolvedValue([
      {
        ...interview,
        groupSelectionId: "other-selection",
        interviewBlockId: otherBlock.id,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
      },
    ])

    const scheduling = service.scheduleInterview(handle, "selection-0", placement)

    if (isAccepted) {
      await expect(scheduling).resolves.toEqual(interview)
    } else {
      await expect(scheduling).rejects.toThrow(InvalidArgumentError)

      expect(repository.createInterview).not.toHaveBeenCalled()
    }
  })

  it.each([
    ["2026-10-12T07:00:00Z", "2026-10-12T07:30:00Z", true],
    ["2026-10-12T14:30:00Z", "2026-10-12T15:00:00Z", true],
    ["2026-10-12T06:59:59.999Z", "2026-10-12T07:29:59.999Z", false],
    ["2026-10-12T14:30:00.001Z", "2026-10-12T15:00:00.001Z", false],
  ])("honors the exact interview window boundaries: %s", async (startsAt, endsAt, isAccepted) => {
    const { service, repository } = setup()
    const scheduling = service.scheduleInterview(handle, "selection-0", {
      ...placement,
      startsAt: new Date(startsAt),
      endsAt: new Date(endsAt),
    })

    if (isAccepted) {
      await expect(scheduling).resolves.toEqual(interview)
    } else {
      await expect(scheduling).rejects.toThrow(InvalidArgumentError)

      expect(repository.createInterview).not.toHaveBeenCalled()
    }
  })

  it("does not use another applicant's availability", async () => {
    const { service, repository } = setup()

    repository.findInterviewMatchingInput.mockResolvedValue({
      ...input,
      availabilityBlocks: input.availabilityBlocks.map((availability) => {
        return {
          ...availability,
          applicationId: "another-applicant",
        }
      }),
    })

    await expect(service.scheduleInterview(handle, "selection-0", placement)).rejects.toThrow(InvalidArgumentError)

    expect(repository.createInterview).not.toHaveBeenCalled()
  })

  it("rejects scheduling, rescheduling, and cancellation when the selection no longer exists", async () => {
    const { service, repository } = setup()

    repository.findGroupSelectionById.mockResolvedValue(null)

    await expect(service.scheduleInterview(handle, "missing-selection", placement)).rejects.toThrow(NotFoundError)
    await expect(service.rescheduleInterview(handle, interview.id, placement)).rejects.toThrow(NotFoundError)
    await expect(service.cancelInterview(handle, interview.id)).rejects.toThrow(NotFoundError)

    expect(repository.createInterview).not.toHaveBeenCalled()
    expect(repository.updateInterview).not.toHaveBeenCalled()
    expect(repository.deleteInterview).not.toHaveBeenCalled()
  })

  it("reschedules one published interview without changing publication or other interviews", async () => {
    const { service, repository } = setup()

    repository.findPeriodById.mockResolvedValue({
      ...period,
      interviewsPublishedAt: closedTime,
    })

    repository.findManyInterviewsByPeriodId.mockResolvedValue([interview])

    await service.rescheduleInterview(handle, interview.id, {
      ...placement,
      startsAt: new Date("2026-10-12T11:00:00Z"),
      endsAt: new Date("2026-10-12T11:30:00Z"),
    })

    expect(repository.updateInterview).toHaveBeenCalledWith(
      handle,
      interview.id,
      expect.objectContaining({
        startsAt: new Date("2026-10-12T11:00:00Z"),
      })
    )

    expect(repository.replaceInterviews).not.toHaveBeenCalled()

    expect(repository.setInterviewsPublishedAt).not.toHaveBeenCalled()
  })

  it("cancels one published interview without unpublishing", async () => {
    const { service, repository } = setup()

    repository.findPeriodById.mockResolvedValue({
      ...period,
      interviewsPublishedAt: closedTime,
    })

    await service.cancelInterview(handle, interview.id)

    expect(repository.deleteInterview).toHaveBeenCalledWith(handle, interview.id)

    expect(repository.setInterviewsPublishedAt).not.toHaveBeenCalled()
  })

  it("rejects an interview block owned by another committee", async () => {
    const { service, repository } = setup()

    await expect(
      service.scheduleInterview(handle, "selection-0", {
        ...placement,
        interviewBlockId: "block-additive",
      })
    ).rejects.toThrow(InvalidArgumentError)

    expect(repository.createInterview).not.toHaveBeenCalled()
  })

  it("rejects an incorrect duration", async () => {
    const { service } = setup()

    await expect(
      service.scheduleInterview(handle, "selection-0", {
        ...placement,
        endsAt: new Date("2026-10-12T10:20:00Z"),
      })
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
        {
          id: "other-selection",
          applicationId: "other-application",
          applicationGroupId: "exclusive",
        },
      ],
    })

    repository.findManyInterviewsByPeriodId.mockResolvedValue([
      {
        ...interview,
        groupSelectionId: "other-selection",
      },
    ])

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
