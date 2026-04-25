import { roundToNearestHours, subMonths } from "date-fns"
import type { Prisma } from "../"

export const EXCEPTIONALLY_DISTINGUISHED_FLAG_NAME = "EXCEPTIONALLY_DISTINGUISHED"

const awardedAt = subMonths(roundToNearestHours(new Date(), { roundingMethod: "ceil" }), 8)

export const getUserFlagLinkFixtures = (userIds: string[], exceptionallyDistinguishedFlagId: string) =>
  [
    {
      id: "7e2c4a91-3b6f-4d18-a5c0-9f1e2b3c4d5e",
      awardedAt,
      reason: "Utmerket arbeid for linjeforeningen, langt utover egen rolles forventning.",
      userId: userIds[0],
      userFlagId: exceptionallyDistinguishedFlagId,
    },
    {
      id: "8f3d5b02-4c70-4e29-b6d1-0a2f3c4d5e6f",
      awardedAt,
      reason: "Utmerket arbeid for linjeforeningen, langt utover egen rolles forventning.",
      userId: userIds[9],
      userFlagId: exceptionallyDistinguishedFlagId,
    },
  ] as const satisfies Prisma.UserFlagLinkCreateManyInput[]
