import { db } from "./db";
import { attendances } from "./fixtures/attendance";
import { attendees } from "./fixtures/attendee";
import { committees } from "./fixtures/committee";
import { companies } from "./fixtures/company";
import { events } from "./fixtures/event";
import { eventCompany } from "./fixtures/event-company";
import { marks } from "./fixtures/mark";
import { products } from "./fixtures/product";
import { productPaymentProviders } from "./fixtures/product-payment-provider";
import { users } from "./fixtures/user";

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
    .execute();

  await db
    .insertInto("company")
    .values(companies)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        description: (eb) => eb.ref("excluded.description"),
        email: (eb) => eb.ref("excluded.email"),
        image: (eb) => eb.ref("excluded.image"),
        location: (eb) => eb.ref("excluded.location"),
        name: (eb) => eb.ref("excluded.name"),
        phone: (eb) => eb.ref("excluded.phone"),
        type: (eb) => eb.ref("excluded.type"),
        website: (eb) => eb.ref("excluded.website"),
      })
    )
    .execute();

  await db
    .insertInto("committee")
    .values(committees)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        description: (eb) => eb.ref("excluded.description"),
        email: (eb) => eb.ref("excluded.email"),
        image: (eb) => eb.ref("excluded.image"),
        name: (eb) => eb.ref("excluded.name"),
      })
    )
    .execute();

  await db
    .insertInto("event")
    .values(events)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        committeeId: (eb) => eb.ref("excluded.committeeId"),
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        description: (eb) => eb.ref("excluded.description"),
        end: (eb) => eb.ref("excluded.end"),
        imageUrl: (eb) => eb.ref("excluded.imageUrl"),
        location: (eb) => eb.ref("excluded.location"),
        public: (eb) => eb.ref("excluded.public"),
        start: (eb) => eb.ref("excluded.start"),
        status: (eb) => eb.ref("excluded.status"),
        subtitle: (eb) => eb.ref("excluded.subtitle"),
        title: (eb) => eb.ref("excluded.title"),
        type: (eb) => eb.ref("excluded.type"),
        updatedAt: (eb) => eb.ref("excluded.updatedAt"),
        waitlist: (eb) => eb.ref("excluded.waitlist"),
      })
    )
    .execute();

  await db
    .insertInto("eventCompany")
    .values(eventCompany)
    .onConflict((oc) => oc.columns(["eventId", "companyId"]).doNothing())
    .execute();

  await db
    .insertInto("attendance")
    .values(attendances)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        deregisterDeadline: (eb) => eb.ref("excluded.deregisterDeadline"),
        end: (eb) => eb.ref("excluded.end"),
        eventId: (eb) => eb.ref("excluded.eventId"),
        limit: (eb) => eb.ref("excluded.limit"),
        max: (eb) => eb.ref("excluded.max"),
        min: (eb) => eb.ref("excluded.min"),
        start: (eb) => eb.ref("excluded.start"),
        updatedAt: (eb) => eb.ref("excluded.updatedAt"),
      })
    )
    .execute();

  await db
    .insertInto("attendee")
    .values(attendees)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        attendanceId: (eb) => eb.ref("excluded.attendanceId"),
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        updatedAt: (eb) => eb.ref("excluded.updatedAt"),
        userId: (eb) => eb.ref("excluded.userId"),
      })
    )
    .execute();

  await db
    .insertInto("mark")
    .values(marks)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        category: (eb) => eb.ref("excluded.category"),
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        details: (eb) => eb.ref("excluded.details"),
        duration: (eb) => eb.ref("excluded.duration"),
        title: (eb) => eb.ref("excluded.title"),
        updatedAt: (eb) => eb.ref("excluded.updatedAt"),
      })
    )
    .execute();

  await db
    .insertInto("product")
    .values(products)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        amount: (eb) => eb.ref("excluded.amount"),
        createdAt: (eb) => eb.ref("excluded.createdAt"),
        deletedAt: (eb) => eb.ref("excluded.deletedAt"),
        isRefundable: (eb) => eb.ref("excluded.isRefundable"),
        objectId: (eb) => eb.ref("excluded.objectId"),
        refundRequiresApproval: (eb) => eb.ref("excluded.refundRequiresApproval"),
        type: (eb) => eb.ref("excluded.type"),
        updatedAt: (eb) => eb.ref("excluded.updatedAt"),
      })
    )
    .execute();

  await db
    .insertInto("productPaymentProvider")
    .values(productPaymentProviders)
    .onConflict((oc) => oc.columns(["productId", "paymentProviderId"]).doNothing())
    .execute();
};
