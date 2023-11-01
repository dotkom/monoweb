import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const users: Insertable<Database["owUser"]>[] = [
  {
    cognitoSub: "4dd4698d-c376-4e5e-b5fb-4db9bf6cd417", // brage.baugerod@online.ntnu.no
    id: "01HB64XF7WXBPGVQKFKFGJBH4D",
    createdAt: new Date("2023-04-30 19:22:17.627253+00"),
    studyYear: 3,
  },
  {
    cognitoSub: "7f6e0389-b49f-4bbc-b401-505f4b53fb3c", // njal.sorland@online.ntnu.no
    id: "11HB64XF7WXBPGVQKFKFGJBH4D",
    createdAt: new Date("2023-08-11 21:22:17.627253+00"),
    studyYear: 5,
  },
  {
    id: "01HB64XF7WZZZZZZZZZZZZZZZZ",
    createdAt: new Date("2023-04-30 21:22:17.627253+00"),
    cognitoSub: "dddddddd-c376-4e5e-b5fb-4db9bf6cd417",
    studyYear: 0,
  },
]
