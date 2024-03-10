import { createEnvironment } from "@dotkomonline/env"
import { type Company } from "@dotkomonline/types"
import { addDays, addMinutes, subDays } from "date-fns"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { getCompanyMock, getJobListingMock } from "../../../../mock"
import { CleanupFunction, createServiceLayerForTesting } from "../../../../vitest-integration.setup"
import { createServiceLayer, type ServiceLayer } from "../../core"
import {
  InvalidDeadlineError,
  InvalidEndDateError,
  InvalidLocationError,
  InvalidStartDateError,
} from "../job-listing-service"

describe("job-listings", () => {
  let core: ServiceLayer
  let company: Company
  let cleanup: CleanupFunction

  beforeEach(async () => {
    const env = createEnvironment()
    const context = await createServiceLayerForTesting(env, "job-listing")
    cleanup = context.cleanup
    core = await createServiceLayer({ db: context.kysely })
    company = await core.companyService.createCompany(getCompanyMock())
  })

  afterEach(async () => {
    await cleanup()
  })

  it("can create new job listings", async () => {
    const jobListing = await core.jobListingService.createJobListing(getJobListingMock(company.id))

    const match = await core.jobListingService.getById(jobListing.id)
    expect(match).toEqual(jobListing)
  })

  it("should fail if the end date is in the past", async () => {
    await expect(
      core.jobListingService.createJobListing(
        getJobListingMock(company.id, {
          end: subDays(new Date(), 1),
        })
      )
    ).rejects.toThrow(InvalidEndDateError)
  })

  it("should fail if the start date is in the past", async () => {
    await expect(
      core.jobListingService.createJobListing(
        getJobListingMock(company.id, {
          start: subDays(new Date(), 1),
        })
      )
    ).rejects.toThrow(InvalidStartDateError)
  })

  it("should fail if the start date is after the end date", async () => {
    await expect(
      core.jobListingService.createJobListing(
        getJobListingMock(company.id, {
          start: addDays(new Date(), 2),
          end: new Date(),
        })
      )
    ).rejects.toThrow(InvalidEndDateError)
  })

  it("should fail if the deadline is after job start", async () => {
    await expect(
      core.jobListingService.createJobListing(
        getJobListingMock(company.id, {
          start: addMinutes(new Date(), 1),
          end: addDays(new Date(), 1),
          deadline: addDays(new Date(), 2),
        })
      )
    ).rejects.toThrow(InvalidDeadlineError)
  })

  it("should fail if there are zero locations specified", async () => {
    await expect(
      core.jobListingService.createJobListing(
        getJobListingMock(company.id, {
          locations: [],
        })
      )
    ).rejects.toThrow(InvalidLocationError)
  })

  it("should be able to update locations by diffing", async () => {
    const jobListing = await core.jobListingService.createJobListing(
      getJobListingMock(company.id, {
        locations: ["Oslo", "Trondheim"],
      })
    )
    const newLocations = ["Trondheim", "Bergen"]
    const updated = await core.jobListingService.updateJobListingById(jobListing.id, {
      ...getJobListingMock(company.id),
      locations: newLocations,
    })

    expect(updated.locations).not.toContain("Oslo")
    expect(updated.locations).toEqual(newLocations)
  })

  it("performing a diff which leaves a tag unused deletes the unused tag", async () => {
    const jobListing = await core.jobListingService.createJobListing(
      getJobListingMock(company.id, {
        locations: ["Oslo", "Trondheim"],
      })
    )

    const allLocations = await core.jobListingService.getLocations()
    expect(allLocations).toContain("Oslo")

    const newLocations = ["Trondheim"]
    const updated = await core.jobListingService.updateJobListingById(jobListing.id, {
      ...getJobListingMock(company.id),
      locations: newLocations,
    })

    const updatedAllLocations = await core.jobListingService.getLocations()
    expect(updatedAllLocations).not.toContain("Oslo")
    expect(updatedAllLocations).toContain("Trondheim")
    expect(updated.locations).toEqual(newLocations)
  })
})
