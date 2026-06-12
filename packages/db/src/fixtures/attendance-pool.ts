import type { Prisma } from "../"

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
    {
      // ITEX
      attendanceId: attendance_ids[4],
      title: "Alle",
      capacity: 100,
      yearCriteria: [1, 2, 3, 4, 5],
    },
    {
      // (ITEX) Kveldsarrangement med Twoday
      attendanceId: attendance_ids[5],
      title: "Alle",
      capacity: 25,
      yearCriteria: [1, 2, 3, 4, 5],
    },
    {
      // 1.klasse eksamensfest
      attendanceId: attendance_ids[6],
      title: "1. klasse",
      capacity: 75,
      yearCriteria: [1],
    },
    {
      // Utmatrikulering 5. klasse
      attendanceId: attendance_ids[7],
      title: "5. klasse",
      capacity: 50,
      yearCriteria: [5],
    },
    {
      // FotballtrøyeFredag!
      attendanceId: attendance_ids[8],
      title: "Alle",
      capacity: 0,
      yearCriteria: [1, 2, 3, 4, 5],
    },
    {
      // Eksamenskurs i Diskret matematikk
      attendanceId: attendance_ids[9],
      title: "Alle",
      capacity: 0,
      yearCriteria: [1, 2, 3, 4, 5],
    },
    {
      // Volleyballturnering med NTNUI
      attendanceId: attendance_ids[10],
      title: "Alle",
      capacity: 15,
      yearCriteria: [1, 2, 3, 4, 5],
    },
    {
      // Eksamenslesing for 1.klasse
      attendanceId: attendance_ids[11],
      title: "1. klasse",
      capacity: 60,
      yearCriteria: [1],
    },
    {
      // 17. mai-frokost
      attendanceId: attendance_ids[12],
      title: "Alle",
      capacity: 70,
      yearCriteria: [1, 2, 3, 4, 5],
    },
  ] as const satisfies Prisma.AttendancePoolCreateManyInput[]
