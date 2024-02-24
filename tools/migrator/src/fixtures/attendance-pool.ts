import { type Insertable } from "kysely"
import { type Database } from "@dotkomonline/db"
import { type InsertedIds } from "../fixture"

export const getPoolFixtures: (
  attendance_ids: InsertedIds["attendance"]
) => Insertable<Database["attendancePool"]>[] = (attendance_ids) => [
  {
    attendanceId: attendance_ids[0],
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    min: 0,
    max: 4,
    limit: 10,
  },
  {
    attendanceId: attendance_ids[0],
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    updatedAt: new Date("2023-02-23 11:03:49.289+00"),
    limit: 10,
    min: 4,
    max: 6,
  },
  {
    attendanceId: attendance_ids[1],
    createdAt: new Date("2023-02-25 11:03:49.289+00"),
    updatedAt: new Date("2023-02-25 11:03:49.289+00"),
    limit: 10,
    min: 1,
    max: 4,
  },
]
