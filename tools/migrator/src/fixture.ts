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

// Derived from https://stackoverflow.com/a/74801694
type LengthArray<Length extends number, _Rest extends string[] = []> = _Rest["length"] extends Length
  ? _Rest
  : LengthArray<Length, [string, ..._Rest]>

type GetResultIdArrayTypeFor<key extends keyof typeof resultIdLengths> = LengthArray<(typeof resultIdLengths)[key]>

const resultIdLengths = {
  owUser: 4,
  company: 2,
  committee: 2,
  event: 2,
  attendance: 2,
  attendancePool: 3,
} as const

export interface ResultIds {
  owUser: GetResultIdArrayTypeFor<"owUser">
  company: GetResultIdArrayTypeFor<"company">
  committee: GetResultIdArrayTypeFor<"committee">
  event: GetResultIdArrayTypeFor<"event">
  attendance: GetResultIdArrayTypeFor<"attendance">
  attendancePool: GetResultIdArrayTypeFor<"attendancePool">
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
    .then((result) => {
      result.forEach((row, idx) => {
        resultIds.owUser[idx] = row.id
      })
    })

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
    .then((result) => {
      result.forEach((row, idx) => {
        resultIds.company[idx] = row.id
      })
    })

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
    .then((result) => {
      result.forEach((row, idx) => {
        resultIds.committee[idx] = row.id
      })
    })

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
    .then((result) => {
      result.forEach((row, idx) => {
        resultIds.event[idx] = row.id
      })
    })

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
    .then((result) => {
      result.forEach((row, idx) => {
        resultIds.attendance[idx] = row.id
      })
    })

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
