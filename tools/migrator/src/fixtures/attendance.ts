import { type Insertable } from "kysely"
import { type Database } from "@dotkomonline/db"
import { type ResultIds } from "../fixture"

export const getAttendanceFixtures: (event_ids: ResultIds["event"]) => Insertable<Database["attendance"]>[] = (
  event_ids
) => [
  {
    eventId: event_ids[0],
    registerStart: new Date("2023-02-22 13:30:04.713+00"),
    registerEnd: new Date("2023-02-22 13:30:04.713+00"),
    deregisterDeadline: new Date("2023-02-22 13:30:04.713+00"),
    mergeTime: new Date("2023-02-22 13:30:04.713+00"),
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
  },
  {
    eventId: event_ids[1],
    registerStart: new Date("2023-02-23 11:03:49.289+00"),
    registerEnd: new Date("2023-02-23 11:03:49.289+00"),
    deregisterDeadline: new Date("2023-02-23 11:03:49.289+00"),
    mergeTime: new Date("2023-02-23 11:03:49.289+00"),
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    updatedAt: new Date("2023-02-23 11:03:49.289+00"),
  },
]
