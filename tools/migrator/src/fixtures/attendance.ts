import type { Database } from "@dotkomonline/db"
import type { Insertable } from "kysely"
import type { InsertedIds } from "../fixture"

export const getAttendanceFixtures: (eventIds: InsertedIds["event"]) => Insertable<Database["attendance"]>[] = (
  eventIds
) => [
  {
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    start: new Date("2023-06-11 15:00:00+00"),
    end: new Date("2023-06-12 15:00:00+00"),
    deregisterDeadline: new Date("2023-06-13 15:00:00+00"),
    limit: 20,
    eventId: eventIds[0],
    min: 0,
    max: 1,
  },
  {
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    updatedAt: new Date("2023-02-23 11:03:49.289+00"),
    start: new Date("2023-06-16 15:00:00+00"),
    end: new Date("2023-06-17 15:00:00+00"),
    deregisterDeadline: new Date("2023-06-18 15:00:00+00"),
    limit: 5,
    eventId: eventIds[1],
    min: 1,
    max: 2,
  },
  {
    createdAt: new Date("2023-02-25 11:03:49.289+00"),
    updatedAt: new Date("2023-02-25 11:03:49.289+00"),
    start: new Date("2023-06-18 15:00:00+00"),
    end: new Date("2023-06-19 15:00:00+00"),
    deregisterDeadline: new Date("2023-06-20 15:00:00+00"),
    limit: 20,
    eventId: eventIds[1],
    min: 2,
    max: 3,
  },
]
