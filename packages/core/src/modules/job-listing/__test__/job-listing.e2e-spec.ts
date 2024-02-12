import { beforeEach, describe, it, expect } from "vitest"
import { createEnvironment } from "@dotkomonline/env"
import { createKysely } from "@dotkomonline/db"
import { type Company } from "@dotkomonline/types"
import { addDays, subDays } from "date-fns"
import { getCompanyMock, getJobListingMock } from "../../../../mock"
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

  beforeEach(async () => {
    const env = createEnvironment()
    const db = createKysely(env)
    core = await createServiceLayer({ db })
    company = await core.companyService.createCompany(getCompanyMock())
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
          start: new Date(),
          end: addDays(new Date(), 2),
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
})
