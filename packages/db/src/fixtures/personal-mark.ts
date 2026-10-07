import { getCurrentUTC } from "@dotkomonline/utils"
import { roundToNearestHours, subDays } from "date-fns"
import type { Prisma } from "../"
import { GUNNAR_GAS_USER_ID, HELLE_HUMMER_USER_ID } from "./user"

const now = roundToNearestHours(getCurrentUTC(), { roundingMethod: "floor" })

export const getPersonalMarkFixtures = (
  markIds: string[],
  givenByUserId: string
): Prisma.PersonalMarkCreateManyInput[] => [
  {
    markId: markIds[0],
    userId: GUNNAR_GAS_USER_ID,
    givenById: givenByUserId,
    createdAt: subDays(now, 3),
  },
  {
    markId: markIds[1],
    userId: HELLE_HUMMER_USER_ID,
    givenById: givenByUserId,
    createdAt: subDays(now, 1),
  },
]
