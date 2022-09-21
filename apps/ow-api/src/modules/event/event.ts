import { z } from "zod"
import { Event as PrismaEvent } from "@dotkom/db"

const eventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().max(100),
  subtitle: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  imageUrl: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  public: z.boolean(),
})

export type Event = z.infer<typeof eventSchema>

export const mapToEvent = (payload: PrismaEvent): Event => {
  return eventSchema.parse(payload)
}