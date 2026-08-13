import { z } from "zod"
import { PublicUserSchema } from "../user/user"

export const OfficeCheckinSchema = z.object({
  id: z.string(),
  time: z.date(),
  userRfid: z.string(),
})

export type OfficeCheckin = z.infer<typeof OfficeCheckinSchema>

export const OfficeCheckinLeaderboardEntrySchema = z.object({
  userRfid: z.string(),
  user: PublicUserSchema.nullable(),
  totalDays: z.number().int().nonnegative(),
  currentStreak: z.number().int().nonnegative(),
})

export type OfficeCheckinLeaderboardEntry = z.infer<typeof OfficeCheckinLeaderboardEntrySchema>

export const PublicOfficeCheckinLeaderboardEntrySchema = OfficeCheckinLeaderboardEntrySchema.omit({
  userRfid: true,
}).extend({
  rank: z.number().int().positive(),
  user: PublicUserSchema,
})

export type PublicOfficeCheckinLeaderboardEntry = z.infer<typeof PublicOfficeCheckinLeaderboardEntrySchema>

export const OfficeCheckinResultSchema = z.object({
  checkin: OfficeCheckinSchema,
  user: PublicUserSchema.nullable(),
})

export type OfficeCheckinResult = z.infer<typeof OfficeCheckinResultSchema>

export const OfficeCheckinLinkSchema = z.object({
  userRfid: z.string().min(1),
  expires: z.number().int().positive(),
  signature: z.string().regex(/^[a-f0-9]{64}$/),
})

export type OfficeCheckinLink = z.infer<typeof OfficeCheckinLinkSchema>
