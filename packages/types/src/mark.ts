import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import { PublicUserSchema } from "./user"
import { GroupSchema } from "./group"
import { addDays, differenceInDays, Interval, isWithinInterval, parse } from "date-fns"

export const MarkSchema = schemas.MarkSchema.extend({})

export type MarkId = Mark["id"]
export type Mark = z.infer<typeof MarkSchema>

export const MarkWriteSchema = MarkSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  userIds: z.array(z.string()).optional(),
})

export type MarkWrite = z.infer<typeof MarkWriteSchema>

export const PersonalMarkSchema = schemas.PersonalMarkSchema

export const CreatePersonalMarkSchema = PersonalMarkSchema.omit({
  createdAt: true,
  givenById: true,
})

// User should not see which user gave the mark
export const VisiblePersonalMarkDetailsSchema = z.object({
  mark: MarkSchema,
  givenByGroup: GroupSchema,
  personalMark: PersonalMarkSchema.omit({
    givenById: true,
  }),
})

export const PersonalMarkDetailsSchema = z.object({
  personalMark: PersonalMarkSchema,
  givenByGroup: GroupSchema,
  user: PublicUserSchema,
  givenBy: PublicUserSchema,
})

export type PersonalMarkDetails = z.infer<typeof PersonalMarkDetailsSchema>

export type VisiblePersonalMarkDetails = z.infer<typeof VisiblePersonalMarkDetailsSchema>

export type PersonalMark = z.infer<typeof PersonalMarkSchema>
