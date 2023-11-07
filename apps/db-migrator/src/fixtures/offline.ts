import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const offlines: Insertable<Database["offline"]>[] = [
  {
    id: "01HD77R4Y4S3WJ44NZ8029VP4P",
    title: "Offline #1",
    published: new Date("2023-10-09T10:00:00+02:00"),
    file: null,
    image: null,
  },
  {
    id: "01HD77R4Y4S3WJ44NZ8029VP4C",
    title: "Offline #2",
    published: new Date("2023-10-09T10:00:00+02:00"),
    file: null,
    image: null,
  },
]
