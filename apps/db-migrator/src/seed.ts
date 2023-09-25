import { faker } from "@faker-js/faker"

import { db } from "./db"
import {users} from "./fixtures/user";
import {events} from "./fixtures/event";
import {attendances} from "./fixtures/attendance";

faker.seed(69)

export const seed = async () => {
    await db
    .insertInto("owUser")
    .values(users)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        cognitoSub: (eb) => eb.ref("excluded.cognitoSub"),
      })
    )
    .execute()

  await db
    .insertInto("event")
    .values(events)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        title: (eb) => eb.ref("excluded.title"),
        description: (eb) => eb.ref("excluded.description"),
        start: (eb) => eb.ref("excluded.start"),
        end: (eb) => eb.ref("excluded.end"),
        location: (eb) => eb.ref("excluded.location"),
        public: (eb) => eb.ref("excluded.public"),
        status: (eb) => eb.ref("excluded.status"),
        type: (eb) => eb.ref("excluded.type"),
      })
    )
    .execute()

  await db
    .insertInto("attendance")
    .values(attendances)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        start: (eb) => eb.ref("excluded.start"),
        end: (eb) => eb.ref("excluded.end"),
        deregisterDeadline: (eb) => eb.ref("excluded.deregisterDeadline"),
        limit: (eb) => eb.ref("excluded.limit"),
      })
    )
    .execute()
}
