import { getCurrentUTC } from "@dotkomonline/utils"
import { subDays } from "date-fns"
import type { Prisma } from "../"
import { userId } from "./user"
import { eventId } from "./event"

export const fixtureDeregisterReasonId = {
  ivarItex: "d1000001-0000-4000-8000-000000000001",
} as const

export const getDeregisterReasonFixtures = (): Prisma.DeregisterReasonCreateManyInput[] => [
  {
    id: fixtureDeregisterReasonId.ivarItex,
    eventId: eventId("itex"),
    userId: userId("ivar"),
    type: "TIME",
    details: "Har eksamen samme uke som ITEX.",
    userGrade: 3,
    registeredAt: subDays(getCurrentUTC(), 10),
  },
]
