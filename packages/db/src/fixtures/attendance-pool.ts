import type { AttendanceId } from "@dotkomonline/types"
import type { Prisma } from "@prisma/client"

export const getPoolFixtures = (attendance_ids: AttendanceId[]): Prisma.AttendancePoolCreateManyInput[] => 
  [
    {
      title: "Sosial + 1. klasse + 2. klasse",
      attendanceId: attendance_ids[0],
      createdAt: new Date("2023-02-22 13:30:04.713+00"),
      updatedAt: new Date("2023-02-22 13:30:04.713+00"),
      capacity: 10,
      yearCriteria: [0, 1, 2],
      isVisible: true,
      type: "NORMAL",
    },
    {
      title: "4. klasse + 5. klasse",
      attendanceId: attendance_ids[0],
      createdAt: new Date("2023-02-23 11:03:49.289+00"),
      updatedAt: new Date("2023-02-23 11:03:49.289+00"),
      capacity: 10,
      yearCriteria: [4, 5],
      isVisible: true,
      type: "NORMAL",
    },
    {
      title: "1. - 5. klasse",
      attendanceId: attendance_ids[1],
      createdAt: new Date("2023-02-25 11:03:49.289+00"),
      updatedAt: new Date("2023-02-25 11:03:49.289+00"),
      capacity: 10,
      yearCriteria: [1, 2, 3, 4, 5],
      isVisible: true,
      type: "NORMAL",
    },
  ]
