import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const attendees: Insertable<Database["attendee"]>[] = [
  {
    id: "01HB64JAPWNDTA2PXF0BK6YTAE",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    userId: "01HB64XF7WZZZZZZZZZZZZZZZZ",
    attendanceId: "01HB64JAPWJBMZN3HN6RF5GPVF",
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
    id: "01HB64JAPXD30K1WYK53HYFXR2",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    userId: "01HB64XF7WXBPGVQKFKFGJBH4D",
    attendanceId: "01HB64JAPWJBMZN3HN6RF5GPVF",
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
    userId: "01HB64XF7WZZZZZZZZZZZZZZZZ",
    attendanceId: "01HB64JAPW4Q0XR46MK831NTB2",
  },
]
