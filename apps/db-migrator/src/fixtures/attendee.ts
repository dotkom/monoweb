import { Database } from "@dotkomonline/db"
import { Insertable } from "kysely"

export const attendees: Insertable<Database["attendee"]>[] = [
  {
    id: "a76532a6-0789-471b-af41-efe99c458f92",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    userId: "71f83a49-4c5c-4249-b01a-59647711f5fb",
    attendanceId: "09971e1c-d1ab-498d-89ca-f0b7645b74f7",
  },
  {
    id: "e9874714-fd1c-4ad2-a768-51ca3d64959f",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    userId: "0ee21040-e30e-4331-a912-05f66ac52eea",
    attendanceId: "09971e1c-d1ab-498d-89ca-f0b7645b74f7",
  },
  {
    id: "a12f4850-a400-4dc8-916a-cd8239dca1e0",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    userId: "71f83a49-4c5c-4249-b01a-59647711f5fb",
    attendanceId: "a12f4850-a400-4dc8-916a-cd8239dca1e0",
  },
]
