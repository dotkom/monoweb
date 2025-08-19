import type { Prisma } from "@prisma/client"
import { addYears, roundToNearestHours, subYears } from "date-fns"

const now = roundToNearestHours(new Date(), { roundingMethod: "ceil" })

const lastYear = subYears(now, 1)
const nextYear = addYears(now, 1)

export const getMembershipFixtures = (userIds: string[]) =>
  [
    {
      userId: userIds[0],
      start: lastYear,
      type: "BACHELOR_STUDENT",
      end: nextYear,
    },
    {
      userId: userIds[1],
      start: lastYear,
      type: "KNIGHT",
      end: nextYear,
    },
    {
      userId: userIds[2],
      start: subYears(now, 4),
      type: "MASTER_STUDENT",
      end: nextYear,
      specialization: "SOFTWARE_ENGINEERING",
    },
  ] as const satisfies Prisma.MembershipCreateManyInput[]
