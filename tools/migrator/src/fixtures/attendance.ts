import { type Database } from "@dotkomonline/db"
import { type Insertable } from "kysely"

export const attendances: Insertable<Database["attendance"]>[] = [
  {
    id: "01HB64JAPWJBMZN3HN6RF5GPVF",
    createdAt: new Date("2023-02-22 13:30:04.713+00"),
    updatedAt: new Date("2023-02-22 13:30:04.713+00"),
    start: new Date("2023-06-11 15:00:00+00"),
    end: new Date("2023-06-12 15:00:00+00"),
    deregisterDeadline: new Date("2023-06-13 15:00:00+00"),
    limit: 20,
    eventId: "01HB64TWZK1C5YK5J7VGNZPDGW",
    min: 0,
    max: 4,
  },
  {
    id: "01HB64JAPW86EXS7A4XG8D6K3X",
    createdAt: new Date("2023-02-23 11:03:49.289+00"),
    updatedAt: new Date("2023-02-23 11:03:49.289+00"),
    start: new Date("2023-06-16 15:00:00+00"),
    end: new Date("2023-06-17 15:00:00+00"),
    deregisterDeadline: new Date("2023-06-18 15:00:00+00"),
    limit: 5,
    eventId: "01HB64TWZK1C5YK5J7VGNZPDGW",
    min: 4,
    max: 6,
  },
  {
    id: "01HB64JAPW4Q0XR46MK831NTB2",
    createdAt: new Date("2023-02-25 11:03:49.289+00"),
    updatedAt: new Date("2023-02-25 11:03:49.289+00"),
    start: new Date("2023-06-18 15:00:00+00"),
    end: new Date("2023-06-19 15:00:00+00"),
    deregisterDeadline: new Date("2023-06-20 15:00:00+00"),
    limit: 20,
    eventId: "01HB64TWZK1N8ABMH8JAE12101",
    min: 1,
    max: 4,
  },
]
