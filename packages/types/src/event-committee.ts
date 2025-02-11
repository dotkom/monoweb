import { z } from "zod"
import { dbSchemas } from "@dotkomonline/db"

export const EventCommitteeSchema = dbSchemas.EventCommitteeSchema.extend({})

export type EventCommittee = z.infer<typeof EventCommitteeSchema>

export const EventCommitteeWriteSchema = EventCommitteeSchema

export type EventCommitteeWrite = z.infer<typeof EventCommitteeWriteSchema>
