import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const offlines: Insertable<Database["offline"]>[] = [
  {
    id: "01HD77R4Y4S3WJ44NZ8029VP4P",
    title: "Job at Bekk",
    published: new Date("2023-10-09T10:00:00+02:00"),
    file: "https://bekk.no",
    image: "https://bekk.no",
  },
  {
    id: "01HD77R4Y4S3WJ44NZ8029VP4C",
    title: "Job at Bekk 2",
    published: new Date("2023-10-09T10:00:00+02:00"),
    file: "https://bekk.no",
    image: "https://bekk.no",
  },
]
