import { Database } from "@dotkomonline/db"
import { Selectable } from "kysely"
import { z } from "zod"

export const eventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  location: z.string().optional(),
  start: z.date(),
  end: z.date(),
  public: z.boolean(),
  status: z.enum(["tba", "open"]),
})

export type Event = z.infer<typeof eventSchema>

export const mapToEvent = (payload: Selectable<Database["event"]>): Event => {
  return eventSchema.parse(payload)
}
