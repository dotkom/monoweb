import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const users: Insertable<Database["owUser"]>[] = [
  {
    id: "user_2PAEtJHM2O9RogYmT1yhx0JifPn",
    cognitoSub: "4dd4698d-c376-4e5e-b5fb-4db9bf6cd417", // brage.baugerod@online.ntnu.no
    createdAt: new Date("2023-04-30 19:22:17.627253+00"),
  },
  {
    id: "user_2PAKWhPTgypXLhisUS5RVHGec1o",
    cognitoSub: "ec39a6c9-a36c-47ac-aec2-5a18aab27f78", // billy
    createdAt: new Date("2023-04-30 21:22:17.627253+00"),
  },
]
