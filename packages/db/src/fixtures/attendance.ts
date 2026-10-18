import { addDays, addHours, addMonths, roundToNearestHours, setHours, setMinutes, subDays } from "date-fns"
import type { Prisma } from "../"

export const fixtureAttendanceId = {
  fixturesCourse: "a1000001-0000-4000-8000-000000000001",
  are2025: "a1000002-0000-4000-8000-000000000002",
  sommerfest2025: "a1000003-0000-4000-8000-000000000003",
  vinkurs: "a1000004-0000-4000-8000-000000000004",
  itex: "a1000005-0000-4000-8000-000000000005",
  itexTwodayEvening: "a1000006-0000-4000-8000-000000000006",
  firstYearExamParty: "a1000007-0000-4000-8000-000000000007",
  fifthYearGraduation: "a1000008-0000-4000-8000-000000000008",
  footballShirtFriday: "a1000009-0000-4000-8000-000000000009",
  discreteMathExamCourse: "a1000010-0000-4000-8000-000000000010",
  volleyball: "a1000011-0000-4000-8000-000000000011",
  firstYearExamReading: "a1000012-0000-4000-8000-000000000012",
  may17Breakfast: "a1000013-0000-4000-8000-000000000013",
} as const

export type FixtureAttendanceKey = keyof typeof fixtureAttendanceId

export const attendanceId = (key: FixtureAttendanceKey): string => fixtureAttendanceId[key]

const now = roundToNearestHours(new Date(), { roundingMethod: "ceil" })

export const getAttendanceFixtures = () =>
  [
    {
      id: fixtureAttendanceId.fixturesCourse,
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
    {
      id: fixtureAttendanceId.are2025,
      registerStart: new Date("2025-02-02 12:00:00+00"),
      registerEnd: new Date("2025-02-22 16:00:00+00"),
      deregisterDeadline: new Date("2025-02-18 22:00:00.00+00"),
      selections: [],
    },
    {
      id: fixtureAttendanceId.sommerfest2025,
      registerStart: addDays(now, 20),
      registerEnd: addHours(addDays(addMonths(now, 1), 5), 15),
      deregisterDeadline: addHours(addDays(addMonths(now, 1), 5), 15),
      selections: [],
    },
    {
      id: fixtureAttendanceId.vinkurs,
      registerStart: setHours(subDays(now, 1), 12),
      registerEnd: setHours(addDays(now, 6), 16),
      deregisterDeadline: setMinutes(setHours(addDays(now, 5), 23), 59),
      selections: [],
    },
    {
      id: fixtureAttendanceId.itex,
      registerStart: setHours(subDays(now, 3), 12),
      registerEnd: setHours(addDays(now, 5), 16),
      deregisterDeadline: setMinutes(setHours(addDays(now, 4), 23), 59),
      selections: [],
    },
    {
      id: fixtureAttendanceId.itexTwodayEvening,
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
    {
      id: fixtureAttendanceId.firstYearExamParty,
      registerStart: subDays(now, 7),
      registerEnd: addDays(now, 13),
      deregisterDeadline: addDays(now, 13),
      selections: [],
    },
    {
      id: fixtureAttendanceId.fifthYearGraduation,
      registerStart: subDays(now, 35),
      registerEnd: subDays(now, 14),
      deregisterDeadline: subDays(now, 15),
      selections: [],
    },
    {
      id: fixtureAttendanceId.footballShirtFriday,
      registerStart: subDays(now, 3),
      registerEnd: addDays(now, 4),
      deregisterDeadline: addDays(now, 4),
      selections: [],
    },
    {
      id: fixtureAttendanceId.discreteMathExamCourse,
      registerStart: subDays(now, 28),
      registerEnd: subDays(now, 18),
      deregisterDeadline: subDays(now, 19),
      selections: [],
    },
    {
      id: fixtureAttendanceId.volleyball,
      registerStart: subDays(now, 30),
      registerEnd: subDays(now, 21),
      deregisterDeadline: subDays(now, 22),
      selections: [],
    },
    {
      id: fixtureAttendanceId.firstYearExamReading,
      registerStart: subDays(now, 5),
      registerEnd: addDays(now, 9),
      deregisterDeadline: addDays(now, 9),
      selections: [],
    },
    {
      id: fixtureAttendanceId.may17Breakfast,
      registerStart: subDays(now, 40),
      registerEnd: subDays(now, 28),
      deregisterDeadline: subDays(now, 29),
      selections: [],
    },
  ] as const satisfies Prisma.AttendanceCreateManyInput[]
