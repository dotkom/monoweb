import type { Company } from "@dotkomonline/types"
import { addDays } from "date-fns"
import { beforeEach, describe, expect, it } from "vitest"
import { core, dbClient } from "../../../vitest-integration.setup"
import { InvalidArgumentError } from "../../error"
import { getCompanyMock, getJobListingMock } from "../../mock"

describe.skip("job-listings", async () => {
  let company: Company

  beforeEach(async () => {
    company = await core.companyService.createCompany(dbClient, getCompanyMock())
  })

  it("can create new job listings", async () => {
    const jobListing = await core.jobListingService.create(dbClient, getJobListingMock(), company.id, [
      "Oslo",
      "Trondheim",
    ])
    const match = await core.jobListingService.getById(dbClient, jobListing.id)
    expect(match).toEqual(jobListing)
  })

  it("should fail if the start date is after the end date", async () => {
    await expect(
      core.jobListingService.create(
        dbClient,
        getJobListingMock({
          start: addDays(new Date(), 2),
          end: new Date(),
        }),
        company.id,
        []
      )
    ).rejects.toThrow(InvalidArgumentError)
  })

  it("should be able to update locations by diffing", async () => {
    const jobListing = await core.jobListingService.create(dbClient, getJobListingMock(), company.id, [
      "Oslo",
      "Trondheim",
    ])
    const newLocations = ["Trondheim", "Bergen"]
    const updated = await core.jobListingService.update(
      dbClient,
      jobListing.id,
      getJobListingMock(),
      company.id,
      newLocations
    )

    expect(updated.locations).not.toContain("Oslo")
    expect(updated.locations).toEqual(newLocations)
  })

  it("performing a diff which leaves a tag unused deletes the unused tag", async () => {
    const jobListing = await core.jobListingService.create(dbClient, getJobListingMock(), company.id, [
      "Oslo",
      "Trondheim",
    ])

    const allLocations = await core.jobListingService.getLocations(dbClient)
    expect(allLocations).toContain("Oslo")

    const newLocations = ["Trondheim"]
    const updated = await core.jobListingService.update(
      dbClient,
      jobListing.id,
      getJobListingMock(),
      company.id,
      newLocations
    )
    const updatedAllLocations = await core.jobListingService.getLocations(dbClient)
    expect(updatedAllLocations).not.toContain("Oslo")
    expect(updatedAllLocations).toContain("Trondheim")
    expect(updated.locations).toEqual(newLocations)
  })
})
