import { addDays, addHours, addMonths, roundToNearestHours, setHours, setMinutes, subDays } from "date-fns"
import type { Prisma } from "../"

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
    // 1.klasse eksamensfest
    {
      registerStart: subDays(now, 7),
      registerEnd: addDays(now, 13),
      deregisterDeadline: addDays(now, 13),
      selections: [],
    },
    // Utmatrikulering 5. klasse
    {
      registerStart: subDays(now, 35),
      registerEnd: subDays(now, 14),
      deregisterDeadline: subDays(now, 15),
      selections: [],
    },
    // FotballtrøyeFredag!
    {
      registerStart: subDays(now, 3),
      registerEnd: addDays(now, 4),
      deregisterDeadline: addDays(now, 4),
      selections: [],
    },
    // Eksamenskurs i Diskret matematikk
    {
      registerStart: subDays(now, 28),
      registerEnd: subDays(now, 18),
      deregisterDeadline: subDays(now, 19),
      selections: [],
    },
    // Volleyballturnering med NTNUI
    {
      registerStart: subDays(now, 30),
      registerEnd: subDays(now, 21),
      deregisterDeadline: subDays(now, 22),
      selections: [],
    },
    // Eksamenslesing for 1.klasse
    {
      registerStart: subDays(now, 5),
      registerEnd: addDays(now, 9),
      deregisterDeadline: addDays(now, 9),
      selections: [],
    },
    // 17. mai-frokost
    {
      registerStart: subDays(now, 40),
      registerEnd: subDays(now, 28),
      deregisterDeadline: subDays(now, 29),
      selections: [],
    },
  ] as const satisfies Prisma.AttendanceCreateManyInput[]
