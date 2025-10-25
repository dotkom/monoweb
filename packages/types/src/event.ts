import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import { AttendanceSchema } from "./attendance"
import { CompanySchema } from "./company"
import { buildAnyOfFilter, buildDateRangeFilter, buildSearchFilter, createSortOrder } from "./filters"
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

export type EventWrite = z.infer<typeof EventWriteSchema>
export const EventWriteSchema = EventSchema.pick({
  status: true,
  type: true,
  title: true,
  start: true,
  end: true,
  description: true,
  imageUrl: true,
  locationTitle: true,
  locationAddress: true,
  locationLink: true,
})

export type EventFilterQuery = z.infer<typeof EventFilterQuerySchema>
export const EventFilterQuerySchema = z
  .object({
    byId: buildAnyOfFilter(EventSchema.shape.id),
    byStartDate: buildDateRangeFilter(),
    byEndDate: buildDateRangeFilter(),
    bySearchTerm: buildSearchFilter(),
    byOrganizingCompany: buildAnyOfFilter(CompanySchema.shape.id),
    byOrganizingGroup: buildAnyOfFilter(GroupSchema.shape.slug),
    excludingOrganizingGroup: buildAnyOfFilter(GroupSchema.shape.slug),
    orderBy: createSortOrder(),
    byStatus: buildAnyOfFilter(EventStatusSchema).default(["PUBLIC"]),
    byType: buildAnyOfFilter(EventTypeSchema),
    excludingType: buildAnyOfFilter(EventTypeSchema).default(["INTERNAL"]),
    byHasFeedbackForm: z.boolean(),
  })
  .partial()

export const EventWithAttendanceSchema = z.object({
  event: EventSchema,
  attendance: AttendanceSchema.nullable(),
})
export type EventWithAttendance = z.infer<typeof EventWithAttendanceSchema>

export const mapEventTypeToLabel = (eventType: EventType) => {
  switch (eventType) {
    case "ACADEMIC":
      return "Kurs"
    case "GENERAL_ASSEMBLY":
      return "Generalforsamling"
    case "INTERNAL":
      return "Intern"
    case "OTHER":
      return "Annet"
    case "COMPANY":
      return "Bedpres"
    case "SOCIAL":
      return "Sosialt"
    case "WELCOME":
      return "Fadderuke"
    default:
      return "Ukjent"
  }
}

export const mapEventStatusToLabel = (status: EventStatus) => {
  switch (status) {
    case "PUBLIC":
      return "Publisert"
    case "DRAFT":
      return "Utkast"
    case "DELETED":
      return "Slettet"
    default:
      return "Ukjent"
  }
}

export type DeregisterReason = z.infer<typeof DeregisterReasonSchema>
export const DeregisterReasonSchema = schemas.DeregisterReasonSchema

export type DeregisterReasonWithEvent = z.infer<typeof DeregisterReasonWithEventSchema>
export const DeregisterReasonWithEventSchema = DeregisterReasonSchema.extend({
  event: EventSchema,
})

export type DeregisterReasonWrite = z.infer<typeof DeregisterReasonWriteSchema>
export const DeregisterReasonWriteSchema = DeregisterReasonSchema.pick({
  type: true,
  details: true,
  userId: true,
  eventId: true,
  registeredAt: true,
  userGrade: true,
})

export const DeregisterReasonTypeSchema = schemas.DeregisterReasonTypeSchema
export type DeregisterReasonType = z.infer<typeof DeregisterReasonTypeSchema>

export const mapDeregisterReasonTypeToLabel = (type: DeregisterReasonType) => {
  switch (type) {
    case "SICK":
      return "Sykdom"
    case "SCHOOL":
      return "Skole"
    case "WORK":
      return "Jobb"
    case "ECONOMY":
      return "Økonomi"
    case "NO_FAMILIAR_FACES":
      return "Ingen bekjentskap"
    case "TIME":
      return "Tidsklemma"
    case "OTHER":
      return "Annet"
    default:
      return "Ukjent"
  }
}
