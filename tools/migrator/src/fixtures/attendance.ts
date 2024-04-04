import { type Insertable } from "kysely"
import { type Database } from "@dotkomonline/db"

export const getAttendanceFixtures: () => Insertable<Database["attendance"]>[] = () => [
  {
    registerStart: new Date("2023-02-22 13:30:04.713+00"),
    registerEnd: new Date("2023-02-22 13:30:04.713+00"),
    deregisterDeadline: new Date("2023-02-22 13:30:04.713+00"),
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    extras: JSON.stringify([
      {
        id: "0",
        name: "Hva vil du ha til mat?",
        choices: [
          {
            id: "0",
            name: "Pizza",
          },
          {
            id: "1",
            name: "Burger",
          },
          {
            id: "2",
            name: "Salad",
          },
        ],
      },
      {
        id: "1",
        name: "Når vil du ha mat?",
        choices: [
          {
            id: "0",
            name: "Når jeg kommer",
          },
          {
            id: "1",
            name: "Halvveis i arrangementet",
          },
          {
            id: "2",
            name: "Til slutt",
          },
        ],
      },
    ]),
  },
  {
    registerStart: new Date("2023-02-23 11:03:49.289+00"),
    registerEnd: new Date("2023-02-23 11:03:49.289+00"),
    deregisterDeadline: new Date("2023-02-23 11:03:49.289+00"),
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    updatedAt: new Date("2023-02-23 11:03:49.289+00"),
    extras: null,
  },
]
