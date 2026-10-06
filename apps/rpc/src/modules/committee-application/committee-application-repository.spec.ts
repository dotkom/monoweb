import type { DBHandle } from "@dotkomonline/db"
import { describe, expect, it } from "vitest"
import { mockDeep } from "vitest-mock-extended"
import { getCommitteeApplicationRepository } from "./committee-application-repository"

describe("CommitteeApplicationRepository.findOpenPeriod", () => {
  const currentTime = new Date("2026-10-06T12:00:00Z")
  const applicationsOpenAt = new Date("2026-10-01T12:00:00Z")
  const applicationsCloseAt = new Date("2026-10-10T12:00:00Z")
  const interviewStartDate = new Date("2026-10-11")
  const interviewEndDate = new Date("2026-10-15")
  const interviewsPublishedAt = new Date("2026-10-11T21:00:00Z")

  it("returns participating application groups with descriptions and images for an open, published period", async () => {
    const handle = mockDeep<DBHandle>()
    const applicationPeriod = {
      id: "period-id",
      name: "Komitéopptak",
      createdAt: currentTime,
      updatedAt: currentTime,
      isDraft: false,
      isEnabled: true,
      applicationsOpenAt: applicationsOpenAt,
      applicationsCloseAt: applicationsCloseAt,
      interviewsStartDate: interviewStartDate,
      interviewsEndDate: interviewEndDate,
      interviewsPublishedAt: interviewsPublishedAt,
      groups: [
        {
          id: "application-group-id",
          type: "EXCLUSIVE",
          group: {
            name: "Drifts- og utviklingskomiteen",
            abbreviation: "Dotkom",
            preferredDisplayName: "ABBREVIATION",
            description: "<p>Vi lager nettsider.</p>",
            imageUrl: "https://example.com/dotkom.png",
          },
        },
        {
          id: "additive-group-id",
          type: "ADDITIVE",
          group: {
            name: "Ekskursjonskomiteen",
            abbreviation: "Ekskom",
            preferredDisplayName: "NAME",
            description: "",
            imageUrl: null,
          },
        },
      ],
    }
    handle.committeeApplicationPeriod.findFirst.mockResolvedValue(applicationPeriod)
    const repository = getCommitteeApplicationRepository()

    await expect(repository.findOpenPeriod(handle, currentTime)).resolves.toEqual({
      id: "period-id",
      name: "Komitéopptak",
      groups: [
        {
          id: "application-group-id",
          name: "Dotkom",
          type: "EXCLUSIVE",
          description: "<p>Vi lager nettsider.</p>",
          imageUrl: "https://example.com/dotkom.png",
        },
        { id: "additive-group-id", name: "Ekskursjonskomiteen", type: "ADDITIVE", description: "", imageUrl: null },
      ],
    })
    expect(handle.committeeApplicationPeriod.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isDraft: false,
          isEnabled: true,
          applicationsOpenAt: { lte: currentTime },
          applicationsCloseAt: { gt: currentTime },
        },
        select: expect.objectContaining({
          groups: expect.objectContaining({
            select: expect.objectContaining({
              type: true,
              group: {
                select: {
                  name: true,
                  abbreviation: true,
                  preferredDisplayName: true,
                  description: true,
                  imageUrl: true,
                },
              },
            }),
          }),
        }),
      })
    )
  })

  it("returns null when there is no open period", async () => {
    const handle = mockDeep<DBHandle>()
    handle.committeeApplicationPeriod.findFirst.mockResolvedValue(null)

    await expect(getCommitteeApplicationRepository().findOpenPeriod(handle, currentTime)).resolves.toBeNull()
  })
})

describe("CommitteeApplicationRepository.findInterviewMatchingInput", () => {
  it("returns null when the period does not exist", async () => {
    const handle = mockDeep<DBHandle>()
    handle.committeeApplicationPeriod.findUnique.mockResolvedValue(null)

    await expect(
      getCommitteeApplicationRepository().findInterviewMatchingInput(handle, "missing-period")
    ).resolves.toBeNull()
  })

  it("maps nested period rows to the matching domain shape using application group IDs", async () => {
    const handle = mockDeep<DBHandle>()
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

    await expect(getCommitteeApplicationRepository().findInterviewMatchingInput(handle, "period-id")).resolves.toEqual({
      interviewsPublishedAt: period.interviewsPublishedAt,
      applications: [{ id: "application-id" }],
      groups: [{ id: "application-group-id", interviewDuration: "MINUTES_20" }],
      groupSelections: [selection],
      availabilityBlocks: [availability],
      interviewBlocks: [block],
    })

    expect(handle.committeeApplicationPeriod.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({ interviewsPublishedAt: true }),
      })
    )
  })
})
