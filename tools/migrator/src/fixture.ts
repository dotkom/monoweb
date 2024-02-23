import { type DB } from "@dotkomonline/db/src/db.generated"
import { db } from "./db"
import { getAttendanceFixtures } from "./fixtures/attendance"
import { getAttendeeFixtures } from "./fixtures/attendee"
import { getCommitteeFixtures } from "./fixtures/committee"
import { getEventCommitteeFixtures } from "./fixtures/committee-organizer"
import { getCompanyFixtures } from "./fixtures/company"
import { getEventFixtures } from "./fixtures/event"
import { getJobListingFixtures, jobListingLocationLinks, jobListingLocations } from "./fixtures/job-listing"
import { marks } from "./fixtures/mark"
import { offlines } from "./fixtures/offline"
import { personalMarks } from "./fixtures/personal-mark"
import { products } from "./fixtures/product"
import { productPaymentProviders } from "./fixtures/product-payment-provider"
import { users } from "./fixtures/user"

async function insert(tableName: keyof DB, fixtures: unknown[]) {
  const resultIds = await db.insertInto(tableName).values(fixtures).execute()
  console.log(`Inserted ${resultIds.length} rows into ${tableName}`)
}

async function insertReturn(tableName: keyof DB, fixtures: unknown[]): Promise<string[]> {
  const resultIds = await db.insertInto(tableName).values(fixtures).returning("id").execute()
  console.log(`Inserted ${resultIds.length} rows into ${tableName}`)
  return resultIds.map((result) => result.id)
}

export type ResultIds = {
  [K in keyof DB]: string[]
}

export const updateResultIds = <T extends keyof ResultIds>(resultIds: ResultIds, key: T, results: { id: string }[]) => {
  results.forEach((result, index) => {
    if (index < resultIds[key].length) {
      resultIds[key][index] = result.id
    }
  })
}

export const runFixtures = async () => {
  const resultIds: ResultIds = {} as ResultIds

  resultIds.owUser = await insertReturn("owUser", users)
  resultIds.company = await insertReturn("company", getCompanyFixtures())
  resultIds.committee = await insertReturn("committee", getCommitteeFixtures())
  resultIds.event = await insertReturn("event", getEventFixtures())
  resultIds.attendance = await insertReturn("attendance", getAttendanceFixtures(resultIds.event))
  resultIds.attendee = await insertReturn("attendee", getAttendeeFixtures(resultIds.attendance, resultIds.owUser))
  resultIds.mark = await insertReturn("mark", marks)
  await insert("personalMark", personalMarks)
  resultIds.product = await insertReturn("product", products)
  await insert("productPaymentProvider", productPaymentProviders)
  await insert("eventCommittee", getEventCommitteeFixtures(resultIds.event, resultIds.committee))
  resultIds.jobListing = await insertReturn("jobListing", getJobListingFixtures(resultIds.company))
  resultIds.jobListingLocation = await insertReturn("jobListingLocation", jobListingLocations)
  resultIds.jobListingLocationLink = await insertReturn("jobListingLocationLink", jobListingLocationLinks)
  resultIds.offline = await insertReturn("offline", offlines)
}
