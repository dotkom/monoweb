import type { DBHandle } from "@dotkomonline/db"
import { describe, expect, it } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { getCommitteeApplicationRepository } from "./committee-application-repository"

const currentTime = new Date("2026-10-06T12:00:00Z")
const period = {
  id: "period",
  createdAt: currentTime,
  updatedAt: currentTime,
  name: "Komitéopptak",
  isDraft: false,
  isEnabled: true,
  applicationsOpenAt: new Date("2026-10-01"),
  applicationsCloseAt: new Date("2026-10-11T20:00:00Z"),
  interviewsStartDate: new Date("2026-10-12"),
  interviewsEndDate: new Date("2026-10-15"),
  interviewsPublishedAt: null,
}
const group = {
  id: "participation",
  groupId: "dotkom",
  applicationPeriodId: period.id,
  createdAt: currentTime,
  updatedAt: currentTime,
  type: "EXCLUSIVE",
  interviewDuration: "MINUTES_30",
  group: {
    name: "Drifts- og utviklingskomiteen",
    abbreviation: "Dotkom",
    preferredDisplayName: "ABBREVIATION",
    description: "<p>Vi lager nettsider.</p>",
    imageUrl: null,
  },
}
const interviewBlock = {
  id: "block",
  applicationGroupId: group.id,
  createdAt: currentTime,
  updatedAt: currentTime,
  startsAt: new Date("2026-10-12T07:00:00Z"),
  endsAt: new Date("2026-10-12T15:00:00Z"),
  locationName: "Room",
  locationUrl: "https://use.mazemap.com/#v=1&campusid=1&sharepoitype=poi&sharepoi=1",
}
const interview = {
  id: "interview",
  groupSelectionId: "selection",
  applicationGroupId: group.id,
  interviewBlockId: interviewBlock.id,
  createdAt: currentTime,
  updatedAt: currentTime,
  startsAt: new Date("2026-10-12T09:00:00Z"),
  endsAt: new Date("2026-10-12T09:30:00Z"),
  interviewBlock,
}
const selection = {
  id: "selection",
  applicationId: "application",
  applicationPeriodId: period.id,
  applicationGroupId: group.id,
  rank: 1,
  createdAt: currentTime,
  updatedAt: currentTime,
  applicationGroup: group,
  interview,
}
const availability = {
  id: "availability",
  applicationId: "application",
  createdAt: currentTime,
  updatedAt: currentTime,
  startsAt: interviewBlock.startsAt,
  endsAt: interviewBlock.endsAt,
}
const application = {
  id: "application",
  userId: "user",
  applicationPeriodId: period.id,
  createdAt: currentTime,
  updatedAt: currentTime,
  aboutMe: "About me",
  studyYear: 2,
  groupSelections: [selection],
  availabilityBlocks: [availability],
  applicationPeriod: period,
}

describe("committee application read views", () => {
  it("returns actual participation IDs and policy for the open period", async () => {
    const handle = mockDeep<DBHandle>()
    handle.committeeApplicationPeriod.findFirst.mockResolvedValue({ ...period, groups: [group] } as never)
    const result = await getCommitteeApplicationRepository().findOpenPeriod(handle, currentTime)
    expect(result?.groups).toEqual([
      { id: group.id, name: "Dotkom", type: "EXCLUSIVE", description: group.group.description, imageUrl: null },
    ])
    expect(result?.applicationsCloseAt).toEqual(period.applicationsCloseAt)
  })
  it("returns null when there is no open period", async () => {
    const handle = mockDeep<DBHandle>()
    handle.committeeApplicationPeriod.findFirst.mockResolvedValue(null)
    await expect(getCommitteeApplicationRepository().findOpenPeriod(handle, currentTime)).resolves.toBeNull()
  })
  it("hides draft interview assignments from the applicant", async () => {
    const handle = mockDeep<DBHandle>()
    handle.committeeApplication.findFirst.mockResolvedValue(application as never)
    const result = await getCommitteeApplicationRepository().findApplicantView(handle, "user")
    expect(result?.groups[0].interview).toBeNull()
    expect(result?.aboutMe).toBe(application.aboutMe)
    expect(result?.availabilityBlocks).toHaveLength(1)
    handle.committeeApplicationPeriod.findUnique.mockResolvedValue(null)

    await expect(
      getCommitteeApplicationRepository().findInterviewMatchingInput(handle, "missing-period", new Date())
    ).resolves.toBeNull()
  })
  it("reveals interviews immediately when the schedule is published", async () => {
    const handle = mockDeep<DBHandle>()
    handle.committeeApplication.findFirst.mockResolvedValue({
      ...application,
      applicationPeriod: { ...period, interviewsPublishedAt: currentTime },
    } as never)
    const result = await getCommitteeApplicationRepository().findApplicantView(handle, "user", period.id)
    expect(result?.groups[0].interview).toEqual({
      id: interview.id,
      startsAt: interview.startsAt,
      endsAt: interview.endsAt,
      locationName: interviewBlock.locationName,
      locationUrl: interviewBlock.locationUrl,
    const startsAt = new Date("2026-10-12T11:50:00Z")
    const endsAt = new Date("2026-10-12T12:10:00Z")
    const interviewsPublishedAt = new Date("2026-10-11T21:00:00Z")

    const selection = {
      id: "selection-id",
      applicationId: "application-id",
      applicationGroupId: "application-group-id",
    }
    const availability = { applicationId: "application-id", startsAt, endsAt }
    const block = {
      id: "block-id",
      applicationGroupId: "application-group-id",
      startsAt,
      endsAt,
      locationName: "Room A",
    }

    const period = {
      id: "period-id",
      name: "Komitéopptak",
      createdAt: startsAt,
      updatedAt: startsAt,
      isDraft: true,
      isEnabled: true,
      applicationsOpenAt: startsAt,
      applicationsCloseAt: endsAt,
      interviewsStartDate: startsAt,
      interviewsEndDate: endsAt,
      interviewsPublishedAt: interviewsPublishedAt,
      applications: [{ id: "application-id", groupSelections: [selection], availabilityBlocks: [availability] }],
      groups: [{ id: "application-group-id", interviewDuration: "MINUTES_20", interviewBlocks: [block] }],
    }

    handle.committeeApplicationPeriod.findUnique.mockResolvedValue(period)

    await expect(
      getCommitteeApplicationRepository().findInterviewMatchingInput(handle, "period-id", new Date())
    ).resolves.toEqual({
      interviewsPublishedAt: period.interviewsPublishedAt,
      applications: [{ id: "application-id" }],
      groups: [{ id: "application-group-id", interviewDuration: "MINUTES_20" }],
      groupSelections: [selection],
      availabilityBlocks: [availability],
      interviewBlocks: [block],
    })
    expect(handle.committeeApplication.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user", applicationPeriodId: period.id, applicationPeriod: { isDraft: false } },
      })
    )
  })
  it("maps persisted rows to matching input with an independent publication reference", async () => {
    const handle = mockDeep<DBHandle>()
    handle.committeeApplicationPeriod.findUnique.mockResolvedValue({
      ...period,
      applications: [application],
      groups: [{ ...group, interviewBlocks: [interviewBlock] }],
    } as never)
    const result = await getCommitteeApplicationRepository().findInterviewMatchingInput(handle, period.id, currentTime)
    expect(result?.publicationReferenceTime).toEqual(currentTime)
    expect(result?.groupSelections).toEqual([
      { id: selection.id, applicationId: application.id, applicationGroupId: group.id },
    ])
    expect(result?.groups[0].id).toBe(group.id)
  })
})

describe("committee application persistence", () => {
  it("preserves exclusive/additive policy when creating participating groups", async () => {
    const handle = mockDeep<DBHandle>()
    const configuration = [{ groupId: "backlog", type: "ADDITIVE" as const, interviewDuration: "MINUTES_30" as const }]
    await getCommitteeApplicationRepository().createGroups(handle, period.id, configuration)
    expect(handle.committeeApplicationGroup.createMany).toHaveBeenCalledWith({
      data: [{ ...configuration[0], applicationPeriodId: period.id }],
    })
  })
  it("persists null ranks for additive selections", async () => {
    const handle = mockDeep<DBHandle>()
    handle.committeeApplication.createMany.mockResolvedValue({ count: 1 })
    handle.committeeApplication.findUniqueOrThrow.mockResolvedValue(application as never)
    await getCommitteeApplicationRepository().submitApplication(handle, "user", {
      applicationPeriodId: period.id,
      aboutMe: application.aboutMe,
      studyYear: 2,
      groupSelections: [{ applicationGroupId: "additive", rank: null }],
      interviewAvailability: [{ startsAt: availability.startsAt, endsAt: availability.endsAt }],
    })
    expect(handle.committeeApplicationGroupSelection.createMany).toHaveBeenCalledWith({
      data: [expect.objectContaining({ applicationGroupId: "additive", rank: null })],
    })
  })
  it("does not create duplicate selections on a retried submission", async () => {
    const handle = mockDeep<DBHandle>()
    handle.committeeApplication.createMany.mockResolvedValue({ count: 0 })
    handle.committeeApplication.findUniqueOrThrow.mockResolvedValue(application as never)
    await getCommitteeApplicationRepository().submitApplication(handle, "user", {
      applicationPeriodId: period.id,
      aboutMe: application.aboutMe,
      studyYear: 2,
      groupSelections: [{ applicationGroupId: group.id, rank: 1 }],
      interviewAvailability: [{ startsAt: availability.startsAt, endsAt: availability.endsAt }],
    })
    expect(handle.committeeApplicationGroupSelection.createMany).not.toHaveBeenCalled()
    expect(handle.committeeApplicationAvailability.createMany).not.toHaveBeenCalled()
  })
})
