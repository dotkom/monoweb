import { Database } from "@dotkomonline/db"
import { faker } from "@faker-js/faker"
import { addHours } from "date-fns"
import { Insertable, Selectable, sql } from "kysely"

import { logger } from "."
import { db } from "./db"

faker.seed(69)

const createRandomUser = (): Insertable<Database["owUser"]> => {
  return {
    id: faker.datatype.uuid(),
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    image: faker.image.avatar(),
  }
}

const createRandomEvent = (): Insertable<Database["Event"]> => {
  const start = faker.date.future()
  return {
    id: faker.datatype.uuid(),
    title: faker.lorem.sentence(),
    subtitle: faker.helpers.arrayElement([faker.lorem.sentence(), undefined]),
    description: faker.lorem.paragraph(),
    start: start,
    end: addHours(start, 8),
    location: faker.address.streetAddress(),
    public: faker.datatype.boolean(),
    status: faker.helpers.arrayElement(["open", "tba"]),
  }
}

const createRandomAttendance = (eventIDs: string[]): Insertable<Database["Attendance"]> => {
  return {
    id: faker.datatype.uuid(),
    eventID: faker.helpers.arrayElement(eventIDs),
    start: faker.date.future(),
    end: faker.date.future(),
    deregisterDeadline: faker.date.future(),
    limit: faker.datatype.number({ min: 5, max: 100 }),
  }
}

export const seed = async () => {
  const users = Array.from({ length: 15 }).map(() => createRandomUser())
  const event = Array.from({ length: 15 }).map(() => createRandomEvent())
  const attendance = Array.from({ length: 15 }).map(() =>
    createRandomAttendance(event.map((e) => e && e.id).filter((e): e is string => !!e))
  )

  await db
    .insertInto("owUser")
    .values(users)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        name: (eb) => eb.ref("excluded.name"),
        password: (eb) => eb.ref("excluded.password"),
        image: (eb) => eb.ref("excluded.image"),
      })
    )
    .execute()

  await db
    .insertInto("Event")
    .values(event)
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
      })
    )
    .execute()

  await db
    .insertInto("Attendance")
    .values(attendance)
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

  // Finds all events with their attendances
  await db
    .selectFrom("Event")
    .leftJoin("Attendance", "Attendance.eventID", "Event.id")
    .selectAll("Event")
    .select(
      sql<
        Selectable<Database["Attendance"][]>
      >`COALESCE(json_agg(attendance) FILTER (WHERE attendance.id IS NOT NULL), '[]')`.as("attendances")
    )
    .groupBy("Event.id")
    .execute()
  logger.info("Done seeding")
}
