import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import { CompanySchema } from "./company"
import { buildAnyOfFilter, buildDateRangeFilter, buildSearchFilter } from "./filters"
import { GroupSchema } from "./group"

/**
 * @packageDocumentation
 *
 * Types related to events, and the "edge relations" on events, such as attendance, hosting groups,
 * companies, attendance pools, and attendees.
 */

export type EventId = Event["id"]
export type EventType = Event["type"]
export type EventStatus = Event["status"]
export type Event = z.infer<typeof EventSchema>
export const EventSchema = schemas.EventSchema.extend({
  companies: z.array(CompanySchema),
  hostingGroups: z.array(GroupSchema),
})

export const EventTypeSchema = schemas.EventTypeSchema
export const EventStatusSchema = schemas.EventStatusSchema
export const EventStatusWriteSchema = schemas.EventStatusSchema.exclude(["DELETED"])

export type EventWrite = z.infer<typeof EventWriteSchema>
export const EventWriteSchema = EventSchema.pick({
  type: true,
  title: true,
  start: true,
  end: true,
  description: true,
  subtitle: true,
  imageUrl: true,
  locationTitle: true,
  locationAddress: true,
  locationLink: true,
}).extend({
  status: EventStatusWriteSchema,
})

export type EventFilterQuery = z.infer<typeof EventFilterQuerySchema>
export const EventFilterQuerySchema = z.object({
  byId: buildAnyOfFilter(EventSchema.shape.id),
  byStartDate: buildDateRangeFilter(),
  bySearchTerm: buildSearchFilter(),
  byOrganizingCompany: buildAnyOfFilter(CompanySchema.shape.id),
  byOrganizingGroup: buildAnyOfFilter(GroupSchema.shape.slug),
})
