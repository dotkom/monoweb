import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"

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

// User should not see which user gave the mark
export const PersonalMarkVisibleInformationSchema = z.object({
  mark: MarkSchema,
  userMark: PersonalMarkSchema.pick({
    markId: true,
    userId: true,
    createdAt: true,
  }),
})

export type PersonalMarkVisibleInformation = z.infer<typeof PersonalMarkVisibleInformationSchema>

export type PersonalMark = z.infer<typeof PersonalMarkSchema>
