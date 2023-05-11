import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const users: Insertable<Database["owUser"]>[] = [
  {
    id: "user_2PAEtJHM2O9RogYmT1yhx0JifPn", // bragebau
    createdAt: new Date("2023-04-30 19:22:17.627253+00"),
  },
  {
    id: "user_2PAKWhPTgypXLhisUS5RVHGec1o", // bragebaugerod
    createdAt: new Date("2023-04-30 21:22:17.627253+00"),
  },
]
