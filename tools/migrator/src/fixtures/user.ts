import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const getUserFixtures: () => Insertable<Database["owUser"]>[] = () => [
  {
    auth0Sub: "auth0|4dd4698d-c376-4e5e-b5fb-4db9bf6cd417", // brage.baugerod@online.ntnu.no
    createdAt: new Date("2023-04-30 19:22:17.627253+00"),
    email: "bragebaugerod@gmail.com",
    // givenName: "brage",
    // familyName: "baugertod",
    name: "brage baugerod",
    studyYear: 3,
    lastSyncedAt: new Date(),
  },
  {
    auth0Sub: "auth0|7f6e0389-b49f-4bbc-b401-505f4b53fb3c", // njal.sorland@online.ntnu.no
    createdAt: new Date("2023-08-11 21:22:17.627253+00"),
    email: "njalsorland@gmail.com",
    // givenName: "njal",
    // familyName: "sorland",
    name: "njal sorland",
    studyYear: 5,
    lastSyncedAt: new Date(),
  },
  {
    createdAt: new Date("2023-04-30 21:22:17.627253+00"), // henrikskog01@gmail.com
    auth0Sub: "auth0|61ea20bf-6964-4484-b7b8-e81952606973",
    email: "henrikskog01@gmail.com",
    // givenName: "henrik",
    // familyName: "skog",
    name: "henrik skog",
    studyYear: 3,
    lastSyncedAt: new Date(),
  },
]
