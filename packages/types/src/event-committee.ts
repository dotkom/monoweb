import { schemas } from "@dotkomonline/db"
import type { z } from "zod"

export const EventCommitteeSchema = schemas.EventCommitteeSchema.extend({})

export type EventCommittee = z.infer<typeof EventCommitteeSchema>

export const EventCommitteeWriteSchema = EventCommitteeSchema

export type EventCommitteeWrite = z.infer<typeof EventCommitteeWriteSchema>
