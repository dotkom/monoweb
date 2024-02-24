import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const getOfflineFixtures: () => Insertable<Database["offline"]>[] = () => [
  {
    title: "Offline #1",
    published: new Date("2023-10-09T10:00:00+02:00"),
    fileUrl: null,
    imageUrl: null,
  },
  {
    title: "Offline #2",
    published: new Date("2023-10-09T10:00:00+02:00"),
    fileUrl: null,
    imageUrl: null,
  },
]
