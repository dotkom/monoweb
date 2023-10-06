import { type Database } from "@dotkomonline/db";
import { faker } from "@faker-js/faker";
import { addHours } from "date-fns";
import { type Insertable } from "kysely";

import { db } from "./db";

faker.seed(69);

const createRandomUser = (): Insertable<Database["owUser"]> => ({
  id: faker.datatype.uuid(),
  name: faker.name.firstName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  image: faker.image.avatar(),
});

const createRandomEvent = (): Insertable<Database["event"]> => {
  const start = faker.date.future();

  return {
    id: faker.datatype.uuid(),
    title: faker.lorem.sentence(),
    subtitle: faker.helpers.arrayElement([faker.lorem.sentence(), undefined]),
    description: faker.lorem.paragraph(),
    start,
    end: addHours(start, 8),
    location: faker.address.streetAddress(),
    public: faker.datatype.boolean(),
    status: faker.helpers.arrayElement(["TBA", "PUBLIC", "NO_LIMIT", "ATTENDANCE"]),
    type: faker.helpers.arrayElement(["BEDPRES", "ACADEMIC"]),
    waitlist: null,
  };
};

const createRandomAttendance = (eventIds: Array<string>): Insertable<Database["attendance"]> => ({
  id: faker.datatype.uuid(),
  eventId: faker.helpers.arrayElement(eventIds),
  start: faker.date.future(),
  end: faker.date.future(),
  deregisterDeadline: faker.date.future(),
  limit: faker.datatype.number({ min: 5, max: 100 }),
  min: 0,
  max: 0,
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
        name: (eb) => eb.ref("excluded.name"),
        password: (eb) => eb.ref("excluded.password"),
        image: (eb) => eb.ref("excluded.image"),
      })
    )
    .execute();

  await db
    .insertInto("event")
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
        start: (eb) => eb.ref("excluded.start"),
        end: (eb) => eb.ref("excluded.end"),
        deregisterDeadline: (eb) => eb.ref("excluded.deregisterDeadline"),
        limit: (eb) => eb.ref("excluded.limit"),
      })
    )
    .execute();
};
