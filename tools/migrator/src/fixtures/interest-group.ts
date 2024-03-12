import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const getInterestGroupFixtures: () => Insertable<Database["interestGroup"]>[] = () => [
  {
    updatedAt: new Date("2023-01-25 19:58:43.138389+00"),
    name: "testWithLink",
    createdAt: new Date("2023-01-25 19:58:43.138389+00"),
    description: "description",
    link: "https://onlinentnu.slack.com/archives/C03S8TX1L",
  },
  {
    updatedAt: new Date("2023-01-25 20:05:31.034217+00"),
    name: "testWithoutLink",
    createdAt: new Date("2023-01-25 20:05:31.034217+00"),
    description: "description",
  },
]
