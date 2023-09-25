import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const users: Insertable<Database["owUser"]>[] = [
  {
    cognitoSub: "4dd4698d-c376-4e5e-b5fb-4db9bf6cd417", // brage.baugerod@online.ntnu.no
    id: "01HB64XF7WXBPGVQKFKFGJBH4D",
    createdAt: new Date("2023-04-30 19:22:17.627253+00"),
  },
  {
    id: "user_2PAKWhPTgypXLhisUS5RVHGec1o",
    createdAt: new Date("2023-04-30 21:22:17.627253+00"),
    cognitoSub: '4dd4698d-c376-4e5e-b5fb-4db9bf6cd417'
  },
]
