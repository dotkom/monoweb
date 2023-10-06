import { type Database } from "@dotkomonline/db";
import { type Insertable } from "kysely";

export const marks: Array<Insertable<Database["mark"]>> = [
  {
    id: "778bba47-e8fa-49b2-bef4-9afa1aa81693",
    updatedAt: new Date("2023-01-25 19:58:43.138389+00"),
    title: "a",
    createdAt: new Date("2023-01-25 19:58:43.138389+00"),
    category: "a",
    details: "a",
    duration: 20,
  },
  {
    id: "139b386f-8b04-4401-ac45-e16c190d12d0",
    updatedAt: new Date("2023-01-25 20:05:31.034217+00"),
    title: "a",
    createdAt: new Date("2023-01-25 20:05:31.034217+00"),
    category: "a",
    details: "a",
    duration: 20,
  },
];
