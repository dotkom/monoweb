import type { Prisma } from "@prisma/client"

export const getPoolFixtures = (attendance_ids: string[]) =>
  [
    {
      // Kurs i å lage fixtures
      attendanceId: attendance_ids[0],
      title: "1. klasse",
      capacity: 0,
      yearCriteria: [1],
      mergeDelayHours: 24,
    },
    {
      // Kurs i å lage fixtures
      attendanceId: attendance_ids[0],
      title: "2. og 3. klasse",
      capacity: 20,
      yearCriteria: [2, 3],
    },
    {
      // Kurs i å lage fixtures
      attendanceId: attendance_ids[0],
      title: "4. og 5. klasse",
      capacity: 20,
      yearCriteria: [4, 5],
    },

    {
      // Åre 2025
      attendanceId: attendance_ids[1],
      title: "Alle",
      capacity: 150,
      yearCriteria: [1, 2, 3, 4, 5],
    },

    {
      // Sommerfest 2025
      attendanceId: attendance_ids[2],
      title: "Alle",
      capacity: 75,
      yearCriteria: [1, 2, 3, 4, 5],
    },

    {
      // Vinkurs 🍷
      attendanceId: attendance_ids[3],
      title: "1. og 4. klasse",
      capacity: 0,
      yearCriteria: [1, 4],
      mergeDelayHours: 48,
    },
    {
      // Vinkurs 🍷
      attendanceId: attendance_ids[3],
      title: "2. klasse",
      capacity: 0,
      yearCriteria: [2],
      mergeDelayHours: 24,
    },
    {
      // Vinkurs 🍷
      attendanceId: attendance_ids[3],
      title: "3. og 5. klasse",
      capacity: 40,
      yearCriteria: [3, 5],
    },
  ] as const satisfies Prisma.AttendancePoolCreateManyInput[]
