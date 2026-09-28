import { subDays } from "date-fns"
import type { Prisma } from "../"
import { ITEX_EVENT_ID } from "./event"
import { getCurrentUTC } from "@dotkomonline/utils"

export const getDeregisterReasonFixtures = (userId: string): Prisma.DeregisterReasonCreateManyInput[] => [
  {
    eventId: ITEX_EVENT_ID,
    userId,
    type: "TIME",
    details: "Har eksamen samme uke som ITEX.",
    userGrade: 3,
    registeredAt: subDays(getCurrentUTC(), 10),
  },
]
