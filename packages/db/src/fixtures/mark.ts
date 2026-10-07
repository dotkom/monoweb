import { getCurrentUTC } from "@dotkomonline/utils"
import { roundToNearestHours } from "date-fns"
import type { Prisma } from "../"

const now = roundToNearestHours(getCurrentUTC(), { roundingMethod: "floor" })

export const getMarkGroupFixtures = (markIds: string[]): Prisma.MarkGroupCreateManyInput[] => [
  {
    markId: markIds[0],
    groupId: "debug",
  },
  {
    markId: markIds[1],
    groupId: "hs",
  },
]

export const getMarkFixtures: () => Prisma.MarkCreateManyInput[] = () => [
  {
    title: "Kom for sent til Åre 2025",
    details: "Hvordan går det i det hele tatt an",
    duration: 14, // days
    weight: 3,
    type: "LATE_ATTENDANCE",
    updatedAt: now,
    createdAt: now,
  },
  {
    title: "Slå Debug-leder",
    details: "Det er ikke lov å slå andre mennesker!",
    duration: 100000, // days
    weight: 6,
    type: "MANUAL",
    updatedAt: now,
    createdAt: now,
  },
]
