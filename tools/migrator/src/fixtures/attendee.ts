import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const attendees: Insertable<Database["attendee"]>[] = [
  {
    id: "01HB64JAPWNDTA2PXF0BK6YTAE",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    userId: "01HNE783GYXSFSFFPMWNQNQG5Q",
    userCognitoSub: "7ba93bf4-2e11-40a9-bcd7-9078ee9090bb",
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
]
