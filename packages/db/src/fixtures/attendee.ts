import { roundToNearestHours, subDays } from "date-fns"
import type { Prisma } from "../"

const now = roundToNearestHours(new Date(), { roundingMethod: "ceil" })

export type AttendancePoolKey = `${string}:${string}`

export const buildAttendancePoolMap = (pools: { id: string; attendanceId: string; title: string }[]) =>
  new Map(pools.map((pool) => [`${pool.attendanceId}:${pool.title}`, pool.id] as const))

const userGrades: (number | null)[] = [2, null, 4, 1, 3, 5, null, 4, 1, 2, 5]

type AttendeeAssignment = {
  attendanceIndex: number
  poolTitle: string
  userIndex: number
  registeredDaysAgo: number
  reserved?: boolean
}

const attendeeAssignments: AttendeeAssignment[] = [
  { attendanceIndex: 0, poolTitle: "2. og 3. klasse", userIndex: 0, registeredDaysAgo: 12 },
  { attendanceIndex: 0, poolTitle: "2. og 3. klasse", userIndex: 9, registeredDaysAgo: 11 },
  { attendanceIndex: 2, poolTitle: "Alle", userIndex: 1, registeredDaysAgo: 18 },
  { attendanceIndex: 2, poolTitle: "Alle", userIndex: 2, registeredDaysAgo: 17 },
  { attendanceIndex: 2, poolTitle: "Alle", userIndex: 5, registeredDaysAgo: 16 },
  { attendanceIndex: 2, poolTitle: "Alle", userIndex: 7, registeredDaysAgo: 15 },
  { attendanceIndex: 3, poolTitle: "3. og 5. klasse", userIndex: 4, registeredDaysAgo: 8 },
  { attendanceIndex: 3, poolTitle: "3. og 5. klasse", userIndex: 10, registeredDaysAgo: 7 },
  { attendanceIndex: 4, poolTitle: "Alle", userIndex: 2, registeredDaysAgo: 5 },
  { attendanceIndex: 4, poolTitle: "Alle", userIndex: 7, registeredDaysAgo: 4 },

  // 1.klasse eksamensfest
  { attendanceIndex: 6, poolTitle: "1. klasse", userIndex: 3, registeredDaysAgo: 5 },
  { attendanceIndex: 6, poolTitle: "1. klasse", userIndex: 8, registeredDaysAgo: 5 },
  { attendanceIndex: 6, poolTitle: "1. klasse", userIndex: 0, registeredDaysAgo: 4 },
  { attendanceIndex: 6, poolTitle: "1. klasse", userIndex: 1, registeredDaysAgo: 4 },
  { attendanceIndex: 6, poolTitle: "1. klasse", userIndex: 9, registeredDaysAgo: 3 },
  { attendanceIndex: 6, poolTitle: "1. klasse", userIndex: 4, registeredDaysAgo: 3 },
  { attendanceIndex: 6, poolTitle: "1. klasse", userIndex: 6, registeredDaysAgo: 2 },
  { attendanceIndex: 6, poolTitle: "1. klasse", userIndex: 10, registeredDaysAgo: 2 },

  // Utmatrikulering 5. klasse
  { attendanceIndex: 7, poolTitle: "5. klasse", userIndex: 4, registeredDaysAgo: 22 },
  { attendanceIndex: 7, poolTitle: "5. klasse", userIndex: 5, registeredDaysAgo: 21 },
  { attendanceIndex: 7, poolTitle: "5. klasse", userIndex: 10, registeredDaysAgo: 20 },
  { attendanceIndex: 7, poolTitle: "5. klasse", userIndex: 2, registeredDaysAgo: 19 },
  { attendanceIndex: 7, poolTitle: "5. klasse", userIndex: 7, registeredDaysAgo: 18 },

  // FotballtrøyeFredag!
  { attendanceIndex: 8, poolTitle: "Alle", userIndex: 0, registeredDaysAgo: 2 },
  { attendanceIndex: 8, poolTitle: "Alle", userIndex: 1, registeredDaysAgo: 2 },
  { attendanceIndex: 8, poolTitle: "Alle", userIndex: 6, registeredDaysAgo: 1 },
  { attendanceIndex: 8, poolTitle: "Alle", userIndex: 9, registeredDaysAgo: 1 },

  // Eksamenskurs i Diskret matematikk
  { attendanceIndex: 9, poolTitle: "Alle", userIndex: 3, registeredDaysAgo: 19 },
  { attendanceIndex: 9, poolTitle: "Alle", userIndex: 8, registeredDaysAgo: 18 },
  { attendanceIndex: 9, poolTitle: "Alle", userIndex: 0, registeredDaysAgo: 17 },
  { attendanceIndex: 9, poolTitle: "Alle", userIndex: 9, registeredDaysAgo: 16 },

  // Volleyballturnering med NTNUI
  { attendanceIndex: 10, poolTitle: "Alle", userIndex: 0, registeredDaysAgo: 24 },
  { attendanceIndex: 10, poolTitle: "Alle", userIndex: 1, registeredDaysAgo: 23 },
  { attendanceIndex: 10, poolTitle: "Alle", userIndex: 2, registeredDaysAgo: 22 },
  { attendanceIndex: 10, poolTitle: "Alle", userIndex: 3, registeredDaysAgo: 21 },
  { attendanceIndex: 10, poolTitle: "Alle", userIndex: 4, registeredDaysAgo: 20 },
  { attendanceIndex: 10, poolTitle: "Alle", userIndex: 5, registeredDaysAgo: 19 },
  { attendanceIndex: 10, poolTitle: "Alle", userIndex: 7, registeredDaysAgo: 18 },
  { attendanceIndex: 10, poolTitle: "Alle", userIndex: 8, registeredDaysAgo: 17 },
  { attendanceIndex: 10, poolTitle: "Alle", userIndex: 9, registeredDaysAgo: 16 },
  { attendanceIndex: 10, poolTitle: "Alle", userIndex: 10, registeredDaysAgo: 15 },

  // Eksamenslesing for 1.klasse
  { attendanceIndex: 11, poolTitle: "1. klasse", userIndex: 3, registeredDaysAgo: 4 },
  { attendanceIndex: 11, poolTitle: "1. klasse", userIndex: 8, registeredDaysAgo: 3 },
  { attendanceIndex: 11, poolTitle: "1. klasse", userIndex: 0, registeredDaysAgo: 2 },

  // 17. mai-frokost
  { attendanceIndex: 12, poolTitle: "Alle", userIndex: 0, registeredDaysAgo: 30 },
  { attendanceIndex: 12, poolTitle: "Alle", userIndex: 1, registeredDaysAgo: 29 },
  { attendanceIndex: 12, poolTitle: "Alle", userIndex: 2, registeredDaysAgo: 28 },
  { attendanceIndex: 12, poolTitle: "Alle", userIndex: 3, registeredDaysAgo: 27 },
  { attendanceIndex: 12, poolTitle: "Alle", userIndex: 4, registeredDaysAgo: 26 },
  { attendanceIndex: 12, poolTitle: "Alle", userIndex: 5, registeredDaysAgo: 25 },
  { attendanceIndex: 12, poolTitle: "Alle", userIndex: 6, registeredDaysAgo: 24 },
  { attendanceIndex: 12, poolTitle: "Alle", userIndex: 7, registeredDaysAgo: 23 },
  { attendanceIndex: 12, poolTitle: "Alle", userIndex: 8, registeredDaysAgo: 22 },
  { attendanceIndex: 12, poolTitle: "Alle", userIndex: 9, registeredDaysAgo: 21 },
]

const resolvePoolId = (
  poolMap: ReadonlyMap<AttendancePoolKey, string>,
  attendanceIds: string[],
  attendanceIndex: number,
  poolTitle: string
): string => {
  const poolId = poolMap.get(`${attendanceIds[attendanceIndex]}:${poolTitle}`)

  if (poolId === undefined) {
    throw new Error(`Missing attendance pool for attendance index ${attendanceIndex} (${poolTitle})`)
  }

  return poolId
}

export const getAttendeeFixtures = (
  poolMap: ReadonlyMap<AttendancePoolKey, string>,
  attendanceIds: string[],
  userIds: string[]
) =>
  attendeeAssignments.map(({ attendanceIndex, poolTitle, userIndex, registeredDaysAgo, reserved = true }) => {
    const registeredAt = subDays(now, registeredDaysAgo)

    return {
      attendanceId: attendanceIds[attendanceIndex],
      attendancePoolId: resolvePoolId(poolMap, attendanceIds, attendanceIndex, poolTitle),
      userId: userIds[userIndex],
      userGrade: userGrades[userIndex],
      reserved,
      earliestReservationAt: registeredAt,
      createdAt: registeredAt,
      updatedAt: registeredAt,
      selections: [],
    } satisfies Prisma.AttendeeCreateManyInput
  })
