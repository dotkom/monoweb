import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const marks: Insertable<Database["mark"]>[] = [
  {
    id: "01HB64TWZK96KY3GRDFDABDSC6",
    updatedAt: new Date("2023-01-25 19:58:43.138389+00"),
    title: "a",
    createdAt: new Date("2023-01-25 19:58:43.138389+00"),
    category: "a",
    details: "a",
    duration: 20,
  },
  {
    id: "01HB64TWZKDFXAG4HX3CQNE6BX",
    updatedAt: new Date("2023-01-25 20:05:31.034217+00"),
    title: "a",
    createdAt: new Date("2023-01-25 20:05:31.034217+00"),
    category: "a",
    details: "a",
    duration: 20,
  },
]
