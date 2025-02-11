import { z } from "zod"
import { dbSchemas } from "@dotkomonline/db"

export const PersonalMarkSchema = dbSchemas.PersonalMarkSchema.extend({})

export type PersonalMark = z.infer<typeof PersonalMarkSchema>

export const PersonalMarkWriteSchema = PersonalMarkSchema

export type PersonalMarkWrite = z.infer<typeof PersonalMarkWriteSchema>
