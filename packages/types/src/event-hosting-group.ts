import { schemas } from "@dotkomonline/db"
import type { z } from "zod"

export const EventHostingGroupSchema = schemas.EventHostingGroupSchema.extend({})

export type EventHostingGroup = z.infer<typeof EventHostingGroupSchema>

export const EventHostingGroupWriteSchema = EventHostingGroupSchema

export type EventHostingGroupWrite = z.infer<typeof EventHostingGroupWriteSchema>
