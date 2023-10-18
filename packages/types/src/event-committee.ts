import { z } from "zod"

export const EventCommitteeSchema = z.object({
  committeeId: z.string(),
  eventId: z.string(),
})

export type EventCommittee = z.infer<typeof EventCommitteeSchema>

export const EventCommitteeWriteSchema = EventCommitteeSchema

export type EventCommitteeWrite = z.infer<typeof EventCommitteeWriteSchema>
