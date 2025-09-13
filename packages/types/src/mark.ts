import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import { GroupSchema } from "./group"
import { PublicUserSchema } from "./user"

export const MarkSchema = schemas.MarkSchema.extend({
  groups: z.array(GroupSchema),
})

export type MarkId = Mark["id"]
export type Mark = z.infer<typeof MarkSchema>

export const MarkWriteSchema = MarkSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
}).omit({
  groups: true,
})

export type MarkWrite = z.infer<typeof MarkWriteSchema>

export const PersonalMarkSchema = schemas.PersonalMarkSchema

export const CreatePersonalMarkSchema = PersonalMarkSchema.pick({
  markId: true,
  userId: true,
})

// User should not see which user gave the mark
export const VisiblePersonalMarkDetailsSchema = z.object({
  mark: MarkSchema,
  personalMark: PersonalMarkSchema.omit({
    givenById: true,
  }),
})

export const PersonalMarkDetailsSchema = z.object({
  personalMark: PersonalMarkSchema,
  givenByGroups: GroupSchema.array(),
  user: PublicUserSchema,
  givenBy: PublicUserSchema.nullable(),
})

export const PunishmentSchema = z.object({
  suspended: z.boolean(),
  /** Delay in hours */
  delay: z.number(),
})

export type PersonalMarkDetails = z.infer<typeof PersonalMarkDetailsSchema>

export type VisiblePersonalMarkDetails = z.infer<typeof VisiblePersonalMarkDetailsSchema>

export type PersonalMark = z.infer<typeof PersonalMarkSchema>

export type Punishment = z.infer<typeof PunishmentSchema>

export const DEFAULT_MARK_DURATION = 14 as const
