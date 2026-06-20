import { schemas } from "@dotkomonline/db/schemas"
import type { z } from "zod"

export const FadderukeSchema = schemas.FadderukeSchema
export type Fadderuke = z.infer<typeof FadderukeSchema>
export type FadderukeId = Fadderuke["id"]

export const FadderukeWriteSchema = FadderukeSchema.pick({
  year: true,
  eventId: true,
})
export type FadderukeWrite = z.infer<typeof FadderukeWriteSchema>
