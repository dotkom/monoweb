import { EventCommitteeSchema, EventSchema } from "@dotkomonline/types"
import { z } from "zod"

export const EventFormSchema = EventSchema.extend({
  committees: z.array(EventCommitteeSchema),
})

export type EventFormSchema = z.infer<typeof EventFormSchema>
