import { getCurrentUTC } from "@dotkomonline/utils"
import { roundToNearestHours } from "date-fns"
import type { Prisma } from "../"
import { groupSlug } from "./group"
export const fixtureMarkId = {
  lateAre2025: "k1000001-0000-4000-8000-000000000001",
  slaaDebugLeader: "k1000002-0000-4000-8000-000000000002",
} as const

export type FixtureMarkKey = keyof typeof fixtureMarkId

export const markId = (key: FixtureMarkKey): string => fixtureMarkId[key]

const now = roundToNearestHours(getCurrentUTC(), { roundingMethod: "floor" })

export const getMarkGroupFixtures = (): Prisma.MarkGroupCreateManyInput[] => [
  {
    markId: markId("lateAre2025"),
    groupId: groupSlug("debug"),
  },
  {
    markId: markId("slaaDebugLeader"),
    groupId: groupSlug("hs"),
  },
]

export const getMarkFixtures = (): Prisma.MarkCreateManyInput[] => [
  {
    id: markId("lateAre2025"),
    title: "Kom for sent til Åre 2025",
    details: "Hvordan går det i det hele tatt an",
    duration: 14,
    weight: 3,
    type: "LATE_ATTENDANCE",
    updatedAt: now,
    createdAt: now,
  },
  {
    id: markId("slaaDebugLeader"),
    title: "Slå Debug-leder",
    details: "Det er ikke lov å slå andre mennesker!",
    duration: 100000,
    weight: 6,
    type: "MANUAL",
    updatedAt: now,
    createdAt: now,
  },
]
