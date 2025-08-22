import type { Prisma } from "@prisma/client"
import { addDays, addHours, addMonths, roundToNearestHours, setHours, setMinutes, subDays } from "date-fns"

const now = roundToNearestHours(new Date(), { roundingMethod: "ceil" })

export const getAttendanceFixtures = () =>
  [
    // Kurs i å lage fixtures
    {
      registerStart: now,
      registerEnd: addDays(now, 7),
      deregisterDeadline: addDays(now, 7),
      selections: [
        {
          id: "0",
          name: "Hva vil du ha til mat?",
          options: [
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
              name: "Sushi",
            },
          ],
        },
        {
          id: "1",
          name: "Når vil du ha mat?",
          options: [
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
      ],
    },
    // Åre 2025
    {
      registerStart: new Date("2025-02-02 12:00:00+00"),
      registerEnd: new Date("2025-02-22 16:00:00+00"),
      deregisterDeadline: new Date("2025-02-18 22:00:00.00+00"),
      selections: [],
    },
    // Sommerfest 2025
    {
      registerStart: addDays(now, 20),
      registerEnd: addHours(addDays(addMonths(now, 1), 5), 15),
      deregisterDeadline: addHours(addDays(addMonths(now, 1), 5), 15),
      selections: [],
    },
    // Vinkurs 🍷
    {
      registerStart: setHours(subDays(now, 1), 12),
      registerEnd: setHours(addDays(now, 6), 16),
      deregisterDeadline: setMinutes(setHours(addDays(now, 5), 23), 59),
      selections: [],
    },
    // ITEX
    {
      registerStart: setHours(subDays(now, 3), 12),
      registerEnd: setHours(addDays(now, 5), 16),
      deregisterDeadline: setMinutes(setHours(addDays(now, 4), 23), 59),
      selections: [],
    },
    // (ITEX) Kveldsarrangement med Twoday
    {
      registerStart: setHours(subDays(now, 1), 12),
      registerEnd: setHours(addDays(now, 6), 16),
      deregisterDeadline: setMinutes(setHours(addDays(now, 5), 23), 59),
      selections: [
        {
          id: "0",
          name: "Hva vil du ha til mat?",
          options: [
            {
              id: "0",
              name: "Pizza",
            },
            {
              id: "1",
              name: "Sushi",
            },
          ],
        },
      ],
    },
  ] as const satisfies Prisma.AttendanceCreateManyInput[]
