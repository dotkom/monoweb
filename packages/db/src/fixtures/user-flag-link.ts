import { roundToNearestHours, subMonths } from "date-fns"
import type { Prisma } from "../"
import { userId } from "./user"

export const EXCEPTIONALLY_DISTINGUISHED_FLAG_NAME = "EXCEPTIONALLY_DISTINGUISHED"

export const fixtureUserFlagLinkId = {
  andersExceptionallyDistinguished: "7e2c4a91-3b6f-4d18-a5c0-9f1e2b3c4d5e",
  jennyExceptionallyDistinguished: "8f3d5b02-4c70-4e29-b6d1-0a2f3c4d5e6f",
} as const

export type FixtureUserFlagLinkKey = keyof typeof fixtureUserFlagLinkId

export const userFlagLinkId = (key: FixtureUserFlagLinkKey): string => fixtureUserFlagLinkId[key]

const awardedAt = subMonths(roundToNearestHours(new Date(), { roundingMethod: "ceil" }), 8)

export const getUserFlagLinkFixtures = (exceptionallyDistinguishedFlagId: string) =>
  [
    {
      id: userFlagLinkId("andersExceptionallyDistinguished"),
      awardedAt,
      reason: "Utmerket arbeid for linjeforeningen, langt utover egen rolles forventning.",
      userId: userId("anders"),
      userFlagId: exceptionallyDistinguishedFlagId,
    },
    {
      id: userFlagLinkId("jennyExceptionallyDistinguished"),
      awardedAt,
      reason: "Utmerket arbeid for linjeforeningen, langt utover egen rolles forventning.",
      userId: userId("jenny"),
      userFlagId: exceptionallyDistinguishedFlagId,
    },
  ] as const satisfies Prisma.UserFlagLinkCreateManyInput[]
