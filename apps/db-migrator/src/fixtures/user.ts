import { type Database } from "@dotkomonline/db";
import { type Insertable } from "kysely";

export const users: Array<Insertable<Database["owUser"]>> = [
  {
    cognitoSub: "4dd4698d-c376-4e5e-b5fb-4db9bf6cd417", // brage.baugerod@online.ntnu.no
    createdAt: new Date("2023-04-30 19:22:17.627253+00"),
    id: "user_2PAEtJHM2O9RogYmT1yhx0JifPn",
  },
  {
    cognitoSub: "2d92881d-f0c7-4e1f-853c-e0ee9a0993c8", // mats@jun.codes
    createdAt: new Date("2023-04-30 21:22:17.627253+00"),
    id: "user_2PAKWhPTgypXLhisUS5RVHGec1o",
  },
];
