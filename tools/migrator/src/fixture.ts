import { type DB } from "@dotkomonline/db/src/db.generated"
import { db } from "./db"
import { getAttendanceFixtures } from "./fixtures/attendance"
import { getAttendeeFixtures } from "./fixtures/attendee"
import { getCommitteeFixtures } from "./fixtures/committee"
import { getEventCommitteeFixtures } from "./fixtures/committee-organizer"
import { getCompanyFixtures } from "./fixtures/company"
import { getEventFixtures } from "./fixtures/event"
import {
  getJobListingFixtures,
  getJobListingLocationFixtures,
  getJobListingLocationLinkFixtures,
} from "./fixtures/job-listing"
import { getMarkFixtures } from "./fixtures/mark"
import { getOfflineFixtures } from "./fixtures/offline"
import { getPersonalMarkFixtures } from "./fixtures/personal-mark"
import { getProductFixtures } from "./fixtures/product"
import { getProductPaymentProviderFixtures } from "./fixtures/product-payment-provider"
import { getUserFixtures } from "./fixtures/user"
import { getPoolFixtures } from "./fixtures/attendance-pool"

interface WithIdentifier {
  id: string
}

export type InsertedIds = {
  [K in keyof DB]: string[]
}

const mapId = (results: WithIdentifier[]) => results.map((res) => res.id)

export const runFixtures = async () => {
  const insertedIds = {} as InsertedIds

  insertedIds.owUser = await db //
    .insertInto("owUser")
    .values(getUserFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.company = await db
    .insertInto("company")
    .values(getCompanyFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.committee = await db
    .insertInto("committee")
    .values(getCommitteeFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.attendance = await db
    .insertInto("attendance")
    .values(getAttendanceFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.event = await db //
    .insertInto("event")
    .values(getEventFixtures(insertedIds.attendance))
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.attendancePool = await db
    .insertInto("attendancePool")
    .values(getPoolFixtures(insertedIds.attendance))
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.attendee = await db
    .insertInto("attendee")
    .values(getAttendeeFixtures(insertedIds.owUser, insertedIds.attendancePool))
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.mark = await db //
    .insertInto("mark")
    .values(getMarkFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.product = await db
    .insertInto("product")
    .values(getProductFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.jobListing = await db
    .insertInto("jobListing")
    .values(getJobListingFixtures(insertedIds.company))
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.jobListingLocation = await db
    .insertInto("jobListingLocation")
    .values(getJobListingLocationFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.jobListingLocationLink = await db
    .insertInto("jobListingLocationLink")
    .values(getJobListingLocationLinkFixtures(insertedIds.jobListing, insertedIds.jobListingLocation))
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.offline = await db
    .insertInto("offline")
    .values(getOfflineFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  // Tables with keys that are not used in other tables
  await db
    .insertInto("eventCommittee")
    .values(getEventCommitteeFixtures(insertedIds.event, insertedIds.committee))
    .execute()

  await db //
    .insertInto("productPaymentProvider")
    .values(getProductPaymentProviderFixtures(insertedIds.product))
    .execute()

  await db //
    .insertInto("personalMark")
    .values(getPersonalMarkFixtures(insertedIds.mark, insertedIds.owUser))
    .execute()
}
