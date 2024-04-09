import type { DB } from "@dotkomonline/db/src/db.generated"
import { db } from "./db"
import { getAttendanceFixtures } from "./fixtures/attendance"
import { getPoolFixtures } from "./fixtures/attendance-pool"
import { getCommitteeFixtures } from "./fixtures/committee"
import { getEventCommitteeFixtures } from "./fixtures/committee-organizer"
import { getCompanyFixtures } from "./fixtures/company"
import { getEventFixtures } from "./fixtures/event"
import { getInterestGroupFixtures } from "./fixtures/interest-group"
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
    .onConflict((eb) => eb.doNothing())
    .values(getUserFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.company = await db
    .insertInto("company")
    .onConflict((eb) => eb.doNothing())
    .values(getCompanyFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.committee = await db
    .insertInto("committee")
    .onConflict((eb) => eb.doNothing())
    .values(getCommitteeFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.attendance = await db
    .insertInto("attendance")
    .onConflict((eb) => eb.doNothing())
    .values(getAttendanceFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.event = await db //
    .insertInto("event")
    .onConflict((eb) => eb.doNothing())
    .values(getEventFixtures(insertedIds.attendance))
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.attendancePool = await db
    .insertInto("attendancePool")
    .onConflict((eb) => eb.doNothing())
    .values(getPoolFixtures(insertedIds.attendance))
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.mark = await db //
    .insertInto("mark")
    .onConflict((eb) => eb.doNothing())
    .values(getMarkFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.product = await db
    .insertInto("product")
    .onConflict((eb) => eb.doNothing())
    .values(getProductFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.jobListing = await db
    .insertInto("jobListing")
    .onConflict((eb) => eb.doNothing())
    .values(getJobListingFixtures(insertedIds.company))
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.jobListingLocation = await db
    .insertInto("jobListingLocation")
    .onConflict((eb) => eb.doNothing())
    .values(getJobListingLocationFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.jobListingLocationLink = await db
    .insertInto("jobListingLocationLink")
    .onConflict((eb) => eb.doNothing())
    .values(getJobListingLocationLinkFixtures(insertedIds.jobListing, insertedIds.jobListingLocation))
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.offline = await db
    .insertInto("offline")
    .onConflict((eb) => eb.doNothing())
    .values(getOfflineFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  insertedIds.interestGroup = await db
    .insertInto("interestGroup")
    .onConflict((eb) => eb.doNothing())
    .values(getInterestGroupFixtures())
    .returning("id")
    .execute()
    .then(mapId)

  // Tables with keys that are not used in other tables
  await db
    .insertInto("eventCommittee")
    .onConflict((eb) => eb.doNothing())
    .values(getEventCommitteeFixtures(insertedIds.event, insertedIds.committee))
    .execute()

  await db //
    .insertInto("productPaymentProvider")
    .onConflict((eb) => eb.doNothing())
    .values(getProductPaymentProviderFixtures(insertedIds.product))
    .execute()

  await db //
    .insertInto("personalMark")
    .onConflict((eb) => eb.doNothing())
    .values(getPersonalMarkFixtures(insertedIds.mark, insertedIds.owUser))
    .execute()
}
