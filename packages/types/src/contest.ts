import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"

export const ContestResultTypeSchema = schemas.ContestResultTypeSchema
export const ContestResultOrderSchema = schemas.ContestResultOrderSchema

export const ContestSchema = schemas.ContestSchema.extend({})
export type ContestId = Contest["id"]
export type Contest = z.infer<typeof ContestSchema>

export const ContestantSchema = schemas.ContestantSchema.extend({})
export type ContestantId = Contestant["id"]
export type Contestant = z.infer<typeof ContestantSchema>

export const ContestTeamSchema = schemas.ContestTeamSchema.extend({})
export type ContestTeamId = ContestTeam["id"]
export type ContestTeam = z.infer<typeof ContestTeamSchema>

export const ContestWriteSchema = ContestSchema.pick({
  name: true,
  description: true,
  resultType: true,
  resultOrder: true,
  groupId: true,
})

export type ContestWrite = z.infer<typeof ContestWriteSchema>

export const ContestUpdateSchema = ContestSchema.pick({
  name: true,
  description: true,
  resultType: true,
  resultOrder: true,
})

export type ContestUpdate = z.infer<typeof ContestUpdateSchema>

export const ContestantWriteSchema = z.object({
  contestId: schemas.ContestantSchema.shape.contestId,
  userId: schemas.ContestantSchema.shape.userId,
  resultValue: schemas.ContestantSchema.shape.resultValue,
})

export type ContestantWrite = z.infer<typeof ContestantWriteSchema>

export const ContestTeamWriteSchema = z.object({
  name: schemas.ContestTeamSchema.shape.name,
  contestantId: schemas.ContestTeamSchema.shape.contestantId,
  memberIds: z.array(z.string()).optional(),
})

export type ContestTeamWrite = z.infer<typeof ContestTeamWriteSchema>

const ContestMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const ContestTeamWithMembersSchema = ContestTeamSchema.extend({
  members: z.array(ContestMemberSchema),
})

export const ContestantDetailSchema = ContestantSchema.extend({
  team: ContestTeamWithMembersSchema.nullable(),
  user: ContestMemberSchema.nullable(),
})

export type ContestantDetail = z.infer<typeof ContestantDetailSchema>
