import { DateFns } from "@dotkomonline/utils"
import type { Prisma } from "@prisma/client"

export const getAttendanceFixtures = (): Prisma.AttendanceCreateManyInput[] => [
  {
    registerStart: new Date(),
    registerEnd: DateFns.addDays(new Date(), 7),
    deregisterDeadline: DateFns.addDays(new Date(), 7),
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
            name: "Salad",
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
    registerStart: new Date(),
    registerEnd: DateFns.addDays(new Date(), 7),
    deregisterDeadline: DateFns.addDays(new Date(), 7),
    selections: [],
  },
]
