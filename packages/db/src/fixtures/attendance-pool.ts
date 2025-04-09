import type { Prisma } from "@prisma/client"

export const getPoolFixtures = (attendance_ids: string[]): Prisma.AttendancePoolCreateManyInput[] => [
  {
    title: "1. klasse",
    attendanceId: attendance_ids[0],
    capacity: 0,
    yearCriteria: [1],
    mergeDelayHours: 24,
  },
  {
    title: "2. og 3. klasse",
    attendanceId: attendance_ids[0],
    capacity: 20,
    yearCriteria: [2, 3],
  },
  {
    title: "4. og 5. klasse",
    attendanceId: attendance_ids[0],
    capacity: 20,
    yearCriteria: [4, 5],
  },
]
