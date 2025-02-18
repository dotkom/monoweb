import { schemas } from "@dotkomonline/db"
import type { z } from "zod"

export const PersonalMarkSchema = schemas.PersonalMarkSchema.extend({})

export type PersonalMark = z.infer<typeof PersonalMarkSchema>

export const PersonalMarkWriteSchema = PersonalMarkSchema

export type PersonalMarkWrite = z.infer<typeof PersonalMarkWriteSchema>
