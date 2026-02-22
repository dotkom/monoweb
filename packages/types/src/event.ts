import { TZDate } from "@date-fns/tz"
import { schemas } from "@dotkomonline/db/schemas"
import { addWeeks, set } from "date-fns"
import { z } from "zod"
import { AttendanceSummarySchema } from "."
import { AttendanceSchema } from "./attendance"
import { CompanySchema } from "./company"
import { FeedbackFormSchema } from "./feedback-form"
import { buildAnyOfFilter, buildDateRangeFilter, buildSearchFilter, createSortOrder } from "./filters"
import { GroupSchema } from "./group"

/**
 * @packageDocumentation
 *
 * Types related to events, and the "edge relations" on events, such as attendance, hosting groups,
 * companies, attendance pools, and attendees.
 */

export type BaseEvent = z.infer<typeof BaseEventSchema>
export const BaseEventSchema = schemas.EventSchema.extend({})

export type Event = z.infer<typeof EventSchema>
export const EventSchema = BaseEventSchema.extend({
  companies: z.array(CompanySchema),
  hostingGroups: z.array(GroupSchema),
})
export type EventId = Event["id"]
export type EventType = Event["type"]
export type EventStatus = Event["status"]

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
  markForMissedAttendance: true,
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

export const EventSummarySchema = EventSchema.pick({
  id: true,
  title: true,
  start: true,
  end: true,
  type: true,
  status: true,
  imageUrl: true,
  parentId: true,
  attendanceId: true,
  locationTitle: true,
})
export type EventSummary = z.infer<typeof EventSummarySchema>

export const EventWithAttendanceSummarySchema = z.object({
  event: EventSummarySchema,
  attendance: AttendanceSummarySchema.nullable(),
})
export type EventWithAttendanceSummary = z.infer<typeof EventWithAttendanceSummarySchema>

export const EventWithFeedbackFormSchema = EventSchema.extend({
  feedbackForm: FeedbackFormSchema,
})
export type EventWithFeedbackFormSchema = z.infer<typeof EventWithFeedbackFormSchema>

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

/** Adds one week and sets the time to 23:59:00 in Europe/Oslo timezone */
export const getDefaultFeedbackAnswerDeadline = (eventEnd: Date, timezone: string = "Europe/Oslo"): TZDate => {
  const date = new TZDate(eventEnd, timezone)

  return set(addWeeks(date, 1), {
    hours: 23,
    minutes: 59,
    seconds: 0,
    milliseconds: 0,
  })
}

export const EVENT_IMAGE_MAX_SIZE_KIB = 5 * 1024
