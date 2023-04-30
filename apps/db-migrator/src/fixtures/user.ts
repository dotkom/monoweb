import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const users: Insertable<Database["owUser"]>[] = [
  {
    id: "71f83a49-4c5c-4249-b01a-59647711f5fb",
    createdAt: new Date("2023-01-03 02:12:54.374715+00"),
    name: "Anhkha Vo",
    email: "dev@akvo.no",
    emailVerified: null,
    password: "doesntmatter",
    image: null,
  },
  {
    id: "0ee21040-e30e-4331-a912-05f66ac52eea",
    createdAt: new Date("2023-01-18 19:22:17.627253+00"),
    name: "Julian Grande",
    email: "juliangrande@gmx.com",
    emailVerified: null,
    password: "doesntmatter",
    image: null,
  },
]
