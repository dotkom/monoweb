import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const attendances: Insertable<Database["attendance"]>[] = [
  {
    id: "09971e1c-d1ab-498d-89ca-f0b7645b74f7",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    start: new Date("2023-06-11 15:00:00+00"),
    end: new Date("2023-06-12 15:00:00+00"),
    deregisterDeadline: new Date("2023-06-13 15:00:00+00"),
    limit: 20,
    eventId: "abdcc9c3-6d6a-4767-8d8a-608d8c091eb1",
    min: 0,
    max: 5,
  },
  {
    id: "5afcbebb-f96f-4c76-b1dc-917039be1749",
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    updatedAt: new Date("2023-02-23 11:03:49.289+00"),
    start: new Date("2023-06-16 15:00:00+00"),
    end: new Date("2023-06-17 15:00:00+00"),
    deregisterDeadline: new Date("2023-06-18 15:00:00+00"),
    limit: 5,
    eventId: "abdcc9c3-6d6a-4767-8d8a-608d8c091eb1",
    min: 0,
    max: 5,
  },
  {
    id: "a12f4850-a400-4dc8-916a-cd8239dca1e0",
    createdAt: new Date("2023-02-25 11:03:49.289+00"),
    updatedAt: new Date("2023-02-25 11:03:49.289+00"),
    start: new Date("2023-06-18 15:00:00+00"),
    end: new Date("2023-06-19 15:00:00+00"),
    deregisterDeadline: new Date("2023-06-20 15:00:00+00"),
    limit: 20,
    eventId: "395fa3ec-2e2b-4cd6-829b-0388761b6917",
    min: 0,
    max: 5,
  },
]
