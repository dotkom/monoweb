import type { Prisma } from "../"
import { attendanceId } from "./attendance"

export const fixtureAttendancePoolId = {
  fixturesCourse_grade1: "p1000001-0000-4000-8000-000000000001",
  fixturesCourse_grade2And3: "p1000002-0000-4000-8000-000000000002",
  fixturesCourse_grade4And5: "p1000003-0000-4000-8000-000000000003",
  are2025_all: "p1000004-0000-4000-8000-000000000004",
  sommerfest2025_all: "p1000005-0000-4000-8000-000000000005",
  vinkurs_grade1And4: "p1000006-0000-4000-8000-000000000006",
  vinkurs_grade2: "p1000007-0000-4000-8000-000000000007",
  vinkurs_grade3And5: "p1000008-0000-4000-8000-000000000008",
  itex_all: "p1000009-0000-4000-8000-000000000009",
  itexTwodayEvening_all: "p1000010-0000-4000-8000-000000000010",
  firstYearExamParty_grade1: "p1000011-0000-4000-8000-000000000011",
  fifthYearGraduation_grade5: "p1000012-0000-4000-8000-000000000012",
  footballShirtFriday_all: "p1000013-0000-4000-8000-000000000013",
  discreteMathExamCourse_all: "p1000014-0000-4000-8000-000000000014",
  volleyball_all: "p1000015-0000-4000-8000-000000000015",
  firstYearExamReading_grade1: "p1000016-0000-4000-8000-000000000016",
  may17Breakfast_all: "p1000017-0000-4000-8000-000000000017",
} as const

export type FixtureAttendancePoolKey = keyof typeof fixtureAttendancePoolId

export const attendancePoolId = (key: FixtureAttendancePoolKey): string => fixtureAttendancePoolId[key]

export const getPoolFixtures = () =>
  [
    {
      id: attendancePoolId("fixturesCourse_grade1"),
      attendanceId: attendanceId("fixturesCourse"),
      title: "1. klasse",
      capacity: 0,
      yearCriteria: [1],
      mergeDelayHours: 24,
    },
    {
      id: attendancePoolId("fixturesCourse_grade2And3"),
      attendanceId: attendanceId("fixturesCourse"),
      title: "2. og 3. klasse",
      capacity: 20,
      yearCriteria: [2, 3],
    },
    {
      id: attendancePoolId("fixturesCourse_grade4And5"),
      attendanceId: attendanceId("fixturesCourse"),
      title: "4. og 5. klasse",
      capacity: 20,
      yearCriteria: [4, 5],
    },
    {
      id: attendancePoolId("are2025_all"),
      attendanceId: attendanceId("are2025"),
      title: "Alle",
      capacity: 150,
      yearCriteria: [1, 2, 3, 4, 5],
    },
    {
      id: attendancePoolId("sommerfest2025_all"),
      attendanceId: attendanceId("sommerfest2025"),
      title: "Alle",
      capacity: 75,
      yearCriteria: [1, 2, 3, 4, 5],
    },
    {
      id: attendancePoolId("vinkurs_grade1And4"),
      attendanceId: attendanceId("vinkurs"),
      title: "1. og 4. klasse",
      capacity: 0,
      yearCriteria: [1, 4],
      mergeDelayHours: 48,
    },
    {
      id: attendancePoolId("vinkurs_grade2"),
      attendanceId: attendanceId("vinkurs"),
      title: "2. klasse",
      capacity: 0,
      yearCriteria: [2],
      mergeDelayHours: 24,
    },
    {
      id: attendancePoolId("vinkurs_grade3And5"),
      attendanceId: attendanceId("vinkurs"),
      title: "3. og 5. klasse",
      capacity: 40,
      yearCriteria: [3, 5],
    },
    {
      id: attendancePoolId("itex_all"),
      attendanceId: attendanceId("itex"),
      title: "Alle",
      capacity: 100,
      yearCriteria: [1, 2, 3, 4, 5],
    },
    {
      id: attendancePoolId("itexTwodayEvening_all"),
      attendanceId: attendanceId("itexTwodayEvening"),
      title: "Alle",
      capacity: 25,
      yearCriteria: [1, 2, 3, 4, 5],
    },
    {
      id: attendancePoolId("firstYearExamParty_grade1"),
      attendanceId: attendanceId("firstYearExamParty"),
      title: "1. klasse",
      capacity: 75,
      yearCriteria: [1],
    },
    {
      id: attendancePoolId("fifthYearGraduation_grade5"),
      attendanceId: attendanceId("fifthYearGraduation"),
      title: "5. klasse",
      capacity: 50,
      yearCriteria: [5],
    },
    {
      id: attendancePoolId("footballShirtFriday_all"),
      attendanceId: attendanceId("footballShirtFriday"),
      title: "Alle",
      capacity: 0,
      yearCriteria: [1, 2, 3, 4, 5],
    },
    {
      id: attendancePoolId("discreteMathExamCourse_all"),
      attendanceId: attendanceId("discreteMathExamCourse"),
      title: "Alle",
      capacity: 0,
      yearCriteria: [1, 2, 3, 4, 5],
    },
    {
      id: attendancePoolId("volleyball_all"),
      attendanceId: attendanceId("volleyball"),
      title: "Alle",
      capacity: 15,
      yearCriteria: [1, 2, 3, 4, 5],
    },
    {
      id: attendancePoolId("firstYearExamReading_grade1"),
      attendanceId: attendanceId("firstYearExamReading"),
      title: "1. klasse",
      capacity: 60,
      yearCriteria: [1],
    },
    {
      id: attendancePoolId("may17Breakfast_all"),
      attendanceId: attendanceId("may17Breakfast"),
      title: "Alle",
      capacity: 70,
      yearCriteria: [1, 2, 3, 4, 5],
    },
  ] as const satisfies Prisma.AttendancePoolCreateManyInput[]
