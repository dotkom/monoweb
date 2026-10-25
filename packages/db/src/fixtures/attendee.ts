import { addHours, roundToNearestHours, subDays } from "date-fns"
import type { Prisma } from "../"
import { attendanceId, type FixtureAttendanceKey } from "./attendance"
import { attendancePoolId, type FixtureAttendancePoolKey } from "./attendance-pool"
import { getVolleyballEventEnd } from "./event"
import { type FixtureUserKey, userId } from "./user"

export const fixtureVolleyballAttendeeId = [
  "c1000001-0000-4000-8000-000000000001",
  "c1000002-0000-4000-8000-000000000002",
  "c1000003-0000-4000-8000-000000000003",
  "c1000004-0000-4000-8000-000000000004",
  "c1000005-0000-4000-8000-000000000005",
  "c1000006-0000-4000-8000-000000000006",
  "c1000007-0000-4000-8000-000000000007",
  "c1000008-0000-4000-8000-000000000008",
  "c1000009-0000-4000-8000-000000000009",
  "c1000010-0000-4000-8000-000000000010",
] as const

const now = roundToNearestHours(new Date(), { roundingMethod: "ceil" })

const userGrades: Record<FixtureUserKey, number | null> = {
  anders: 2,
  berta: null,
  carl: 4,
  dina: 1,
  eirik: 3,
  frida: 5,
  gunnar: null,
  helle: 4,
  ivar: 1,
  jenny: 2,
  kasper: 5,
}

type AttendeeAssignment = {
  attendance: FixtureAttendanceKey
  pool: FixtureAttendancePoolKey
  user: FixtureUserKey
  registeredDaysAgo: number
  registered?: boolean
}

const attendeeAssignments: AttendeeAssignment[] = [
  { attendance: "fixturesCourse", pool: "fixturesCourse_grade2And3", user: "anders", registeredDaysAgo: 12 },
  { attendance: "fixturesCourse", pool: "fixturesCourse_grade2And3", user: "kasper", registeredDaysAgo: 11 },
  { attendance: "fixturesCourse", pool: "fixturesCourse_grade2And3", user: "berta", registeredDaysAgo: 10 },
  { attendance: "sommerfest2025", pool: "sommerfest2025_all", user: "berta", registeredDaysAgo: 18 },
  { attendance: "sommerfest2025", pool: "sommerfest2025_all", user: "carl", registeredDaysAgo: 17 },
  { attendance: "sommerfest2025", pool: "sommerfest2025_all", user: "frida", registeredDaysAgo: 16 },
  { attendance: "sommerfest2025", pool: "sommerfest2025_all", user: "helle", registeredDaysAgo: 15 },
  { attendance: "vinkurs", pool: "vinkurs_grade3And5", user: "eirik", registeredDaysAgo: 8 },
  { attendance: "vinkurs", pool: "vinkurs_grade3And5", user: "kasper", registeredDaysAgo: 7 },
  { attendance: "itex", pool: "itex_all", user: "carl", registeredDaysAgo: 5 },
  { attendance: "itex", pool: "itex_all", user: "helle", registeredDaysAgo: 4 },
  { attendance: "firstYearExamParty", pool: "firstYearExamParty_grade1", user: "dina", registeredDaysAgo: 5 },
  { attendance: "firstYearExamParty", pool: "firstYearExamParty_grade1", user: "ivar", registeredDaysAgo: 5 },
  { attendance: "firstYearExamParty", pool: "firstYearExamParty_grade1", user: "anders", registeredDaysAgo: 4 },
  { attendance: "firstYearExamParty", pool: "firstYearExamParty_grade1", user: "berta", registeredDaysAgo: 4 },
  { attendance: "firstYearExamParty", pool: "firstYearExamParty_grade1", user: "jenny", registeredDaysAgo: 3 },
  { attendance: "firstYearExamParty", pool: "firstYearExamParty_grade1", user: "eirik", registeredDaysAgo: 3 },
  { attendance: "firstYearExamParty", pool: "firstYearExamParty_grade1", user: "gunnar", registeredDaysAgo: 2 },
  { attendance: "firstYearExamParty", pool: "firstYearExamParty_grade1", user: "kasper", registeredDaysAgo: 2 },
  { attendance: "fifthYearGraduation", pool: "fifthYearGraduation_grade5", user: "eirik", registeredDaysAgo: 22 },
  { attendance: "fifthYearGraduation", pool: "fifthYearGraduation_grade5", user: "frida", registeredDaysAgo: 21 },
  { attendance: "fifthYearGraduation", pool: "fifthYearGraduation_grade5", user: "kasper", registeredDaysAgo: 20 },
  { attendance: "fifthYearGraduation", pool: "fifthYearGraduation_grade5", user: "carl", registeredDaysAgo: 19 },
  { attendance: "fifthYearGraduation", pool: "fifthYearGraduation_grade5", user: "helle", registeredDaysAgo: 18 },
  { attendance: "footballShirtFriday", pool: "footballShirtFriday_all", user: "anders", registeredDaysAgo: 2 },
  { attendance: "footballShirtFriday", pool: "footballShirtFriday_all", user: "berta", registeredDaysAgo: 2 },
  { attendance: "footballShirtFriday", pool: "footballShirtFriday_all", user: "gunnar", registeredDaysAgo: 1 },
  { attendance: "footballShirtFriday", pool: "footballShirtFriday_all", user: "kasper", registeredDaysAgo: 1 },
  { attendance: "discreteMathExamCourse", pool: "discreteMathExamCourse_all", user: "dina", registeredDaysAgo: 19 },
  { attendance: "discreteMathExamCourse", pool: "discreteMathExamCourse_all", user: "ivar", registeredDaysAgo: 18 },
  { attendance: "discreteMathExamCourse", pool: "discreteMathExamCourse_all", user: "anders", registeredDaysAgo: 17 },
  { attendance: "discreteMathExamCourse", pool: "discreteMathExamCourse_all", user: "kasper", registeredDaysAgo: 16 },
  { attendance: "volleyball", pool: "volleyball_all", user: "anders", registeredDaysAgo: 24 },
  { attendance: "volleyball", pool: "volleyball_all", user: "berta", registeredDaysAgo: 23 },
  { attendance: "volleyball", pool: "volleyball_all", user: "carl", registeredDaysAgo: 22 },
  { attendance: "volleyball", pool: "volleyball_all", user: "dina", registeredDaysAgo: 21 },
  { attendance: "volleyball", pool: "volleyball_all", user: "eirik", registeredDaysAgo: 20 },
  { attendance: "volleyball", pool: "volleyball_all", user: "frida", registeredDaysAgo: 19 },
  { attendance: "volleyball", pool: "volleyball_all", user: "helle", registeredDaysAgo: 18 },
  { attendance: "volleyball", pool: "volleyball_all", user: "ivar", registeredDaysAgo: 17 },
  { attendance: "volleyball", pool: "volleyball_all", user: "jenny", registeredDaysAgo: 16 },
  { attendance: "volleyball", pool: "volleyball_all", user: "kasper", registeredDaysAgo: 15 },
  { attendance: "firstYearExamReading", pool: "firstYearExamReading_grade1", user: "dina", registeredDaysAgo: 4 },
  { attendance: "firstYearExamReading", pool: "firstYearExamReading_grade1", user: "ivar", registeredDaysAgo: 3 },
  { attendance: "firstYearExamReading", pool: "firstYearExamReading_grade1", user: "anders", registeredDaysAgo: 2 },
  { attendance: "may17Breakfast", pool: "may17Breakfast_all", user: "anders", registeredDaysAgo: 30 },
  { attendance: "may17Breakfast", pool: "may17Breakfast_all", user: "berta", registeredDaysAgo: 29 },
  { attendance: "may17Breakfast", pool: "may17Breakfast_all", user: "carl", registeredDaysAgo: 28 },
  { attendance: "may17Breakfast", pool: "may17Breakfast_all", user: "dina", registeredDaysAgo: 27 },
  { attendance: "may17Breakfast", pool: "may17Breakfast_all", user: "eirik", registeredDaysAgo: 26 },
  { attendance: "may17Breakfast", pool: "may17Breakfast_all", user: "frida", registeredDaysAgo: 25 },
  { attendance: "may17Breakfast", pool: "may17Breakfast_all", user: "gunnar", registeredDaysAgo: 24 },
  { attendance: "may17Breakfast", pool: "may17Breakfast_all", user: "helle", registeredDaysAgo: 23 },
  { attendance: "may17Breakfast", pool: "may17Breakfast_all", user: "ivar", registeredDaysAgo: 22 },
  { attendance: "may17Breakfast", pool: "may17Breakfast_all", user: "kasper", registeredDaysAgo: 21 },
]

export const getAttendeeFixtures = () => {
  let volleyballAttendeeIndex = 0

  return attendeeAssignments.map(({ attendance, pool, user, registeredDaysAgo, registered = true }) => {
    const registeredAt = subDays(now, registeredDaysAgo)
    const isVolleyballAttendee = attendance === "volleyball"

    return {
      ...(isVolleyballAttendee
        ? {
            id: fixtureVolleyballAttendeeId[volleyballAttendeeIndex++],
            attendedAt: addHours(getVolleyballEventEnd(), 1),
          }
        : {}),
      attendanceId: attendanceId(attendance),
      attendancePoolId: attendancePoolId(pool),
      userId: userId(user),
      userGrade: userGrades[user],
      registeredAt: registered ? registeredAt : null,
      createdAt: registeredAt,
      updatedAt: registeredAt,
      selections: [],
    } satisfies Prisma.AttendeeCreateManyInput
  })
}
