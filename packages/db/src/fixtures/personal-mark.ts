import { getCurrentUTC } from "@dotkomonline/utils"
import { roundToNearestHours, subDays } from "date-fns"
import type { Prisma } from "../"
import { markId } from "./mark"
import { userId } from "./user"

const now = roundToNearestHours(getCurrentUTC(), { roundingMethod: "floor" })

export const getPersonalMarkFixtures = (): Prisma.PersonalMarkCreateManyInput[] => [
  {
    markId: markId("lateAre2025"),
    userId: userId("gunnar"),
    givenById: userId("anders"),
    createdAt: subDays(now, 3),
  },
  {
    markId: markId("slaaDebugLeader"),
    userId: userId("helle"),
    givenById: userId("anders"),
    createdAt: subDays(now, 1),
  },
]
