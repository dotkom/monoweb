import { Prisma } from "@dotkomonline/db"
import { z } from "zod"

export const eventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  location: z.string().optional(),
  start: z.date(),
  end: z.date(),
  public: z.boolean(),
  status: z.enum(["PRIVATE", "PUBLIC"]),
  organizerId: z.string().uuid(),
})

export type Event = z.infer<typeof eventSchema>
export type InsertEvent = Omit<Event, "id">

export const mapToEvent = (payload: Prisma.EventGetPayload<null>): Event => {
  return eventSchema.parse(payload)
}
