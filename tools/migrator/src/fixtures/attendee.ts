import { type Insertable } from "kysely"
import { type Database } from "@dotkomonline/db"
import { type InsertedIds } from "../fixture"

// export const attendees: Insertable<Database["attendee"]>[] = [
export const getAttendeeFixtures: (
  user_ids: InsertedIds["owUser"],
  attendance_ids: InsertedIds["attendance"],
  attendance_pool_ids: InsertedIds["attendancePool"]
) => Insertable<Database["attendee"]>[] = (user_ids, attendance_ids, attendance_pool_ids) => [
  {
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    userId: user_ids[3],
    attendanceId: attendance_ids[0],
    attendancePoolId: attendance_pool_ids[0],
    extrasChoices: JSON.stringify([
      {
        id: "1",
        choice: "1",
      },
      {
        id: "2",
        choice: "3",
      },
    ]),
  },
]
