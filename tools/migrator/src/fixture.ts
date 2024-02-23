import { db } from "./db"
import { committees } from "./fixtures/committee"
import { getEventCommitteeFixtures } from "./fixtures/committee-organizer"
import { getCompanyFixtures } from "./fixtures/company"
import {
  getAttendanceFixtures,
  getAttendeesFixtures,
  getEventCompany,
  getEventsFixtures,
  getPoolFixtures,
} from "./fixtures/event"
import { jobListingLocationLinks, jobListingLocations, jobListings } from "./fixtures/job-listing"
import { marks } from "./fixtures/mark"
import { offlines } from "./fixtures/offline"
import { personalMarks } from "./fixtures/personal-mark"
import { products } from "./fixtures/product"
import { productPaymentProviders } from "./fixtures/product-payment-provider"
import { users } from "./fixtures/user"

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
  console.log("inserted users")

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
  console.log("inserted companies")

  await db
    .insertInto("committee")
    .values(committees)
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

  console.log("inserted committees")

  const eventFixtures = getEventsFixtures()
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

  console.log("inserted events")

  console.log(resultIds)

  const eventCompanyFixtures = getEventCompany(resultIds.event, resultIds.company)
  await db
    .insertInto("eventCompany")
    .values(eventCompanyFixtures)
    .onConflict((oc) => oc.columns(["eventId", "companyId"]).doNothing())
    .execute()

  console.log("inserted eventCompanies")

  const attendanceFixtures = getAttendanceFixtures(resultIds.event)
  await db
    .insertInto("attendance")
    .values(attendanceFixtures)
    .returning("id")
    .execute()
    .then((result) => {
      result.forEach((row, idx) => {
        resultIds.attendance[idx] = row.id
      })
    })

  console.log("inserted attendances", resultIds.attendance)

  const poolFixtures = getPoolFixtures(resultIds.attendance)
  await db
    .insertInto("attendancePool")
    .values(poolFixtures)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        updatedAt: (eb) => eb.ref("excluded.updatedAt"),
        limit: (eb) => eb.ref("excluded.limit"),
        min: (eb) => eb.ref("excluded.min"),
        max: (eb) => eb.ref("excluded.max"),
      })
    )
    .execute()
    .then((result) => {
      result.forEach((row, idx) => {
        resultIds.attendancePool[idx] = row.id
      })
    })

  console.log("inserted pools")

  const attendeeFixtures = getAttendeesFixtures(resultIds.owUser, resultIds.attendancePool)
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
  console.log("inserted marks")

  await db
    .insertInto("personalMark")
    .values(personalMarks)
    .onConflict((oc) => oc.columns(["userId", "markId"]).doNothing())
    .execute()

  console.log("inserted personal marks")

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

  console.log("inserted products")

  await db
    .insertInto("productPaymentProvider")
    .values(productPaymentProviders)
    .onConflict((oc) => oc.columns(["productId", "paymentProviderId"]).doNothing())
    .execute()
  console.log("inserted productPaymentProviders")

  const eventCommittees = getEventCommitteeFixtures(resultIds.event, resultIds.committee)
  await db
    .insertInto("eventCommittee")
    .values(eventCommittees)
    .returning("committeeId")
    .onConflict((oc) => oc.columns(["committeeId", "eventId"]).doNothing())
    .execute()
  console.log("inserted eventCommittees")

  await db
    .insertInto("jobListing")
    .values(jobListings)
    .returning("id")
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()
  console.log("inserted jobListings")

  await db
    .insertInto("jobListingLocation")
    .values(jobListingLocations)
    .returning(["id", "name"])
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()
  console.log("inserted jobListingLocations")

  await db
    .insertInto("jobListingLocationLink")
    .values(jobListingLocationLinks)
    .returning("id")
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()
  console.log("inserted jobListingLocationLinks")

  await db
    .insertInto("offline")
    .values(offlines)
    .returning("id")
    .onConflict((oc) => oc.column("id").doNothing())
    .execute()
  console.log("inserted offlines")
}
