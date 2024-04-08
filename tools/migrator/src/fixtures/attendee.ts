import type { Database } from "@dotkomonline/db"
import type { Insertable } from "kysely"
import type { InsertedIds } from "../fixture"

export const getAttendeeFixtures: (
  attendanceIds: InsertedIds["attendance"],
  userIds: InsertedIds["owUser"]
) => Insertable<Database["attendee"]>[] = (attendanceIds, userIds) => [
  {
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    userId: userIds[0],
    attendanceId: attendanceIds[0],
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
  {
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    userId: userIds[1],
    attendanceId: attendanceIds[0],
    extrasChoices: JSON.stringify([
      {
        id: "1",
        choice: "2",
      },
      {
        id: "2",
        choice: "3",
      },
    ]),
  },
  {
    id: "01HB64JAPW4Q0XR46MK831NTB2",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    userId: userIds[2],
    attendanceId: attendanceIds[0],
  },
]
