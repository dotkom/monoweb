import { type Insertable } from "kysely"
import { type Database } from "@dotkomonline/db"

export const getAttendanceFixtures: () => Insertable<Database["attendance"]>[] = () => [
  {
    registerStart: new Date("2023-02-22 13:30:04.713+00"),
    registerEnd: new Date("2023-02-22 13:30:04.713+00"),
    deregisterDeadline: new Date("2023-02-22 13:30:04.713+00"),
    mergeTime: new Date("2023-02-22 13:30:04.713+00"),
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
  },
  {
    registerStart: new Date("2023-02-23 11:03:49.289+00"),
    registerEnd: new Date("2023-02-23 11:03:49.289+00"),
    deregisterDeadline: new Date("2023-02-23 11:03:49.289+00"),
    mergeTime: new Date("2023-02-23 11:03:49.289+00"),
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    updatedAt: new Date("2023-02-23 11:03:49.289+00"),
  },
]
