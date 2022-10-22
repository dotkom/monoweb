import { z } from "zod"

export const eventSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  subtitle: z.string().optional(),
  imageUrl: z.string().optional(),
  location: z.string().optional(),
  start: z.date(),
  end: z.date(),
  public: z.boolean(),
  eventStatus: z.enum(["private", "public"]),
  organizerId: z.string().uuid(),
})

export type Event = z.infer<typeof eventSchema>
export type InsertEvent = Omit<Event, "id">
