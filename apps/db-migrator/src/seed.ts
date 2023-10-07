import { type Database } from "@dotkomonline/db";
import { faker } from "@faker-js/faker";
import { addHours } from "date-fns";
import { type Insertable } from "kysely";

import { db } from "./db";

faker.seed(69);

const createRandomUser = (): Insertable<Database["owUser"]> => ({
  email: faker.internet.email(),
  id: faker.datatype.uuid(),
  image: faker.image.avatar(),
  name: faker.name.firstName(),
  password: faker.internet.password(),
});

const createRandomEvent = (): Insertable<Database["event"]> => {
  const start = faker.date.future();

  return {
    description: faker.lorem.paragraph(),
    end: addHours(start, 8),
    id: faker.datatype.uuid(),
    location: faker.address.streetAddress(),
    public: faker.datatype.boolean(),
    start,
    status: faker.helpers.arrayElement(["TBA", "PUBLIC", "NO_LIMIT", "ATTENDANCE"]),
    subtitle: faker.helpers.arrayElement([faker.lorem.sentence(), undefined]),
    title: faker.lorem.sentence(),
    type: faker.helpers.arrayElement(["BEDPRES", "ACADEMIC"]),
    waitlist: null,
  };
};

const createRandomAttendance = (eventIds: Array<string>): Insertable<Database["attendance"]> => ({
  deregisterDeadline: faker.date.future(),
  end: faker.date.future(),
  eventId: faker.helpers.arrayElement(eventIds),
  id: faker.datatype.uuid(),
  limit: faker.datatype.number({ max: 100, min: 5 }),
  max: 0,
  min: 0,
  start: faker.date.future(),
});

export const seed = async () => {
  const users = Array.from({ length: 15 }).map(() => createRandomUser());
  const event = Array.from({ length: 15 }).map(() => createRandomEvent());
  const attendance = Array.from({ length: 15 }).map(() =>
    createRandomAttendance(event.map((e) => e.id).filter((e): e is string => Boolean(e)))
  );

  await db
    .insertInto("owUser")
    .values(users)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        image: (eb) => eb.ref("excluded.image"),
        name: (eb) => eb.ref("excluded.name"),
        password: (eb) => eb.ref("excluded.password"),
      })
    )
    .execute();

  await db
    .insertInto("event")
    .values(event)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        description: (eb) => eb.ref("excluded.description"),
        end: (eb) => eb.ref("excluded.end"),
        location: (eb) => eb.ref("excluded.location"),
        public: (eb) => eb.ref("excluded.public"),
        start: (eb) => eb.ref("excluded.start"),
        status: (eb) => eb.ref("excluded.status"),
        title: (eb) => eb.ref("excluded.title"),
        type: (eb) => eb.ref("excluded.type"),
      })
    )
    .execute();

  await db
    .insertInto("attendance")
    .values(attendance)
    .returning("id")
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        deregisterDeadline: (eb) => eb.ref("excluded.deregisterDeadline"),
        end: (eb) => eb.ref("excluded.end"),
        limit: (eb) => eb.ref("excluded.limit"),
        start: (eb) => eb.ref("excluded.start"),
      })
    )
    .execute();
};
