import { buildAnyOfFilter } from "@dotkomonline/utils"
import { z } from "zod"
import { GroupSchema } from "../group/group"
import { PublicUserSchema, UserSchema } from "../user/user"

export const MarkTypeSchema = z.enum([
  "MANUAL",
  "LATE_ATTENDANCE",
  "MISSED_ATTENDANCE",
  "MISSING_FEEDBACK",
  "MISSING_PAYMENT",
])
export type MarkType = z.infer<typeof MarkTypeSchema>

export const MarkSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    details: z.string().nullable(),
    duration: z.number().int(),
    weight: z.number().int(),
    type: MarkTypeSchema.default("MANUAL"),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .extend({
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

export const PersonalMarkSchema = z.object({
  createdAt: z.date(),
  markId: z.string(),
  userId: z.string(),
  givenById: z.string().nullable(),
})

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

export type MarkFilterQuery = z.infer<typeof MarkFilterQuerySchema>
export const MarkFilterQuerySchema = z
  .object({
    byId: buildAnyOfFilter(MarkSchema.shape.id),
    byGivenToUserId: buildAnyOfFilter(UserSchema.shape.id),
  })
  .partial()
