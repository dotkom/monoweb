import { z } from "zod"
import { GroupSchema } from "../group/group"

export const ContestResultTypeSchema = z.enum(["SCORE", "DURATION", "WINNER"])
export type ContestResultType = z.infer<typeof ContestResultTypeSchema>

export const ContestResultOrderSchema = z.enum(["ASC", "DESC"])
export type ContestResultOrder = z.infer<typeof ContestResultOrderSchema>

export const ContestSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  startDate: z.date().nullable(),
  resultType: ContestResultTypeSchema,
  resultOrder: ContestResultOrderSchema,
  winnerContestantId: z.string().nullable(),
  groups: GroupSchema.shape.slug.array().min(1),
})
export type Contest = z.infer<typeof ContestSchema>
export type ContestId = Contest["id"]

export const ContestWriteSchema = ContestSchema.pick({
  description: true,
  startDate: true,
  resultType: true,
  resultOrder: true,
  groups: true,
  name: true,
})
export type ContestWrite = z.infer<typeof ContestWriteSchema>

export const ContestUpdateSchema = ContestWriteSchema.partial()
export type ContestUpdate = z.infer<typeof ContestUpdateSchema>

export const ContestantSchema = z.object({
  id: z.string(),
  resultValue: z.number().int().nullable(),
  contestId: z.string(),
  userId: z.string().nullable(),
})
export type Contestant = z.infer<typeof ContestantSchema>
export type ContestantId = Contestant["id"]

export type ContestantWrite = z.infer<typeof ContestantWriteSchema>
export const ContestantWriteSchema = ContestantSchema.pick({
  contestId: true,
  userId: true,
  resultValue: true,
})

export const ContestUserSummarySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  imageUrl: z.string().nullable(),
  username: z.string(),
})
export type ContestUserSummary = z.infer<typeof ContestUserSummarySchema>

export const ContestTeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  contestantId: z.string(),
})
export type ContestTeam = z.infer<typeof ContestTeamSchema>

export const ContestTeamDetailDbSchema = ContestTeamSchema.extend({
  members: z.array(ContestUserSummarySchema),
})
export type ContestTeamDetailDb = z.infer<typeof ContestTeamDetailDbSchema>

export const ContestTeamDetailSchema = ContestTeamDetailDbSchema.extend({
  memberCount: z.int().nonnegative(),
})
export type ContestTeamDetail = z.infer<typeof ContestTeamDetailSchema>

export const ContestantDetailDbSchema = ContestantSchema.extend({
  team: ContestTeamDetailDbSchema.nullable(),
  user: ContestUserSummarySchema.nullable(),
})
export type ContestantDetailDb = z.infer<typeof ContestantDetailDbSchema>

export const ContestantDetailSchema = ContestantSchema.extend({
  team: ContestTeamDetailSchema.nullable(),
  user: ContestUserSummarySchema.nullable(),
  participantCount: z.int().nonnegative(),
})
export type ContestantDetail = z.infer<typeof ContestantDetailSchema>
