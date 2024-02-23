import { db } from "./db"
import { getAttendanceFixtures } from "./fixtures/attendance"
import { getAttendeeFixtures } from "./fixtures/attendee"
import { getCommitteeFixtures } from "./fixtures/committee"
import { getEventCommitteeFixtures } from "./fixtures/committee-organizer"
import { getCompanyFixtures } from "./fixtures/company"
import { getEventFixtures } from "./fixtures/event"
import { getEventCompany } from "./fixtures/event-company"
import { getJobListingFixtures, jobListingLocationLinks, jobListingLocations } from "./fixtures/job-listing"
import { marks } from "./fixtures/mark"
import { offlines } from "./fixtures/offline"
import { personalMarks } from "./fixtures/personal-mark"
import { products } from "./fixtures/product"
import { productPaymentProviders } from "./fixtures/product-payment-provider"
import { users } from "./fixtures/user"

// https://stackoverflow.com/a/74801694
type LengthArray<T, N extends number, R extends T[] = []> = number extends N
  ? T[]
  : R["length"] extends N
  ? R
  : LengthArray<T, N, [T, ...R]>

export interface ResultIds {
  owUser: LengthArray<string, 4>
  company: LengthArray<string, 2>
  committee: LengthArray<string, 2>
  event: LengthArray<string, 2>
  attendance: LengthArray<string, 2>
  attendancePool: LengthArray<string, 3>
}

export const updateResultIds = <T extends keyof ResultIds>(resultIds: ResultIds, key: T, results: { id: string }[]) => {
  results.forEach((result, index) => {
    if (index < resultIds[key].length) {
      resultIds[key][index] = result.id
    }
  })
}

export const runFixtures = async () => {
  const resultIds: ResultIds = {
    owUser: ["", "", "", ""],
    company: ["", ""],
    committee: ["", ""],
    event: ["", ""],
    attendance: ["", ""],
    attendancePool: ["", "", ""],
  }
  await db
    .insertInto("owUser")
    .values(users)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        createdAt: (eb) => eb.ref("excluded.createdAt"),
      })
    )
    .execute()
    .then(updateResultIds.bind(null, resultIds, "owUser"))

  const companyFixtures = getCompanyFixtures()
  await db
    .insertInto("company")
    .values(companyFixtures)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        name: (eb) => eb.ref("excluded.name"),
        description: (eb) => eb.ref("excluded.description"),
        phone: (eb) => eb.ref("excluded.phone"),
        email: (eb) => eb.ref("excluded.email"),
        website: (eb) => eb.ref("excluded.website"),
        location: (eb) => eb.ref("excluded.location"),
        type: (eb) => eb.ref("excluded.type"),
        image: (eb) => eb.ref("excluded.image"),
      })
    )
    .execute()
    .then(updateResultIds.bind(null, resultIds, "company"))

  const committeFixtures = getCommitteeFixtures()
  await db
    .insertInto("committee")
    .values(committeFixtures)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        name: (eb) => eb.ref("excluded.name"),
        description: (eb) => eb.ref("excluded.description"),
        email: (eb) => eb.ref("excluded.email"),
        image: (eb) => eb.ref("excluded.image"),
      })
    )
    .execute()
    .then(updateResultIds.bind(null, resultIds, "committee"))

  const eventFixtures = getEventFixtures()
  await db
    .insertInto("event")
    .values(eventFixtures)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        updatedAt: (eb) => eb.ref("excluded.updatedAt"),
        title: (eb) => eb.ref("excluded.title"),
        start: (eb) => eb.ref("excluded.start"),
        end: (eb) => eb.ref("excluded.end"),
        status: (eb) => eb.ref("excluded.status"),
        type: (eb) => eb.ref("excluded.type"),
        public: (eb) => eb.ref("excluded.public"),
        description: (eb) => eb.ref("excluded.description"),
        subtitle: (eb) => eb.ref("excluded.subtitle"),
        imageUrl: (eb) => eb.ref("excluded.imageUrl"),
        location: (eb) => eb.ref("excluded.location"),
      })
    )
    .execute()
    .then(updateResultIds.bind(null, resultIds, "event"))

  const eventCompanyFixtures = getEventCompany(resultIds.event, resultIds.company)
  await db
    .insertInto("eventCompany")
    .values(eventCompanyFixtures)
    .onConflict((oc) => oc.columns(["eventId", "companyId"]).doNothing())
    .execute()

  const attendanceFixtures = getAttendanceFixtures(resultIds.event)
  await db
    .insertInto("attendance")
    .values(attendanceFixtures)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        updatedAt: (eb) => eb.ref("excluded.updatedAt"),
        start: (eb) => eb.ref("excluded.start"),
        end: (eb) => eb.ref("excluded.end"),
        deregisterDeadline: (eb) => eb.ref("excluded.deregisterDeadline"),
        limit: (eb) => eb.ref("excluded.limit"),
        eventId: (eb) => eb.ref("excluded.eventId"),
        min: (eb) => eb.ref("excluded.min"),
        max: (eb) => eb.ref("excluded.max"),
      })
    )
    .execute()
    .then(updateResultIds.bind(null, resultIds, "attendance"))

  const attendeeFixtures = getAttendeeFixtures(resultIds.attendance, resultIds.owUser)
  await db.insertInto("attendee").values(attendeeFixtures).returning("id").execute()

  await db
    .insertInto("mark")
    .values(marks)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        updatedAt: (eb) => eb.ref("excluded.updatedAt"),
        title: (eb) => eb.ref("excluded.title"),
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        category: (eb) => eb.ref("excluded.category"),
        details: (eb) => eb.ref("excluded.details"),
        duration: (eb) => eb.ref("excluded.duration"),
      })
    )
    .execute()

  await db
    .insertInto("personalMark")
    .values(personalMarks)
    .onConflict((oc) => oc.columns(["userId", "markId"]).doNothing())
    .execute()

  await db
    .insertInto("product")
    .values(products)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        updatedAt: (eb) => eb.ref("excluded.updatedAt"),
        type: (eb) => eb.ref("excluded.type"),
        objectId: (eb) => eb.ref("excluded.objectId"),
        amount: (eb) => eb.ref("excluded.amount"),
        deletedAt: (eb) => eb.ref("excluded.deletedAt"),
        isRefundable: (eb) => eb.ref("excluded.isRefundable"),
        refundRequiresApproval: (eb) => eb.ref("excluded.refundRequiresApproval"),
      })
    )
    .execute()

  await db
    .insertInto("productPaymentProvider")
    .values(productPaymentProviders)
    .onConflict((oc) => oc.columns(["productId", "paymentProviderId"]).doNothing())
    .execute()

  const eventCommitteFixtures = getEventCommitteeFixtures(resultIds.event, resultIds.committee)
  await db
    .insertInto("eventCommittee")
    .values(eventCommitteFixtures)
    .returning("committeeId")
    .onConflict((oc) => oc.columns(["committeeId", "eventId"]).doNothing())
    .execute()

  const jobListingFixtures = getJobListingFixtures(resultIds.company)
  await db
    .insertInto("jobListing")
    .values(jobListingFixtures)
    .returning("id")
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()

  await db
    .insertInto("jobListingLocation")
    .values(jobListingLocations)
    .returning(["id", "name"])
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()

  await db
    .insertInto("jobListingLocationLink")
    .values(jobListingLocationLinks)
    .returning("id")
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()

  await db
    .insertInto("offline")
    .values(offlines)
    .returning("id")
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()
}
