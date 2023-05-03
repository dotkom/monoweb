import { attendances } from "./fixtures/attendance"
import { attendees } from "./fixtures/attendee"
import { committees } from "./fixtures/committee"
import { companies } from "./fixtures/company"
import { db } from "./db"
import { eventCompany } from "./fixtures/event-company"
import { events } from "./fixtures/event"
import { marks } from "./fixtures/mark"
import { productPaymentProviders } from "./fixtures/product-payment-provider"
import { products } from "./fixtures/product"
import { users } from "./fixtures/user"

export const runFixtures = async () => {
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

  await db
    .insertInto("company")
    .values(companies)
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

  await db
    .insertInto("committee")
    .values(committees)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        name: (eb) => eb.ref("excluded.name"),
      })
    )
    .execute()

  await db
    .insertInto("event")
    .values(events)
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
        committeeId: (eb) => eb.ref("excluded.committeeId"),
      })
    )
    .execute()

  await db
    .insertInto("eventCompany")
    .values(eventCompany)
    .onConflict((oc) => oc.columns(["eventId", "companyId"]).doNothing())
    .execute()

  await db
    .insertInto("attendance")
    .values(attendances)
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
      })
    )
    .execute()

  await db
    .insertInto("attendee")
    .values(attendees)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        updatedAt: (eb) => eb.ref("excluded.updatedAt"),
        userId: (eb) => eb.ref("excluded.userId"),
        attendanceId: (eb) => eb.ref("excluded.attendanceId"),
      })
    )
    .execute()

  await db
    .insertInto("mark")
    .values(marks)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        updatedAt: (eb) => eb.ref("excluded.updatedAt"),
        title: (eb) => eb.ref("excluded.title"),
        givenAt: (eb) => eb.ref("excluded.givenAt"),
        category: (eb) => eb.ref("excluded.category"),
        details: (eb) => eb.ref("excluded.details"),
        duration: (eb) => eb.ref("excluded.duration"),
      })
    )
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
      })
    )
    .execute()

  await db
    .insertInto("productPaymentProvider")
    .values(productPaymentProviders)
    .onConflict((oc) => oc.columns(["productId", "paymentProviderId"]).doNothing())
    .execute()
}
