import { TZDate } from "@date-fns/tz"
import { buildAnyOfFilter, buildDateRangeFilter, buildSearchFilter, createSortOrder } from "@dotkomonline/utils"
import { addWeeks, set } from "date-fns"
import { z } from "zod"
import { CompanySchema } from "../company/company"
import { FeedbackFormSchema } from "../feedback-form/feedback-form"
import { GroupSchema, type GroupType } from "../group/group"
import { AttendanceSchema, AttendanceSummarySchema } from "./attendance"

/**
 * @packageDocumentation
 *
 * Types related to events, and the "edge relations" on events, such as attendance, hosting groups,
 * companies, attendance pools, and attendees.
 */

export const EventTypeSchema = z.enum([
  "GENERAL_ASSEMBLY",
  "COMPANY",
  "ACADEMIC",
  "SOCIAL",
  "INTERNAL",
  "OTHER",
  "WELCOME",
])
export const EventStatusSchema = z.enum(["DRAFT", "PUBLIC", "DELETED"])

export type BaseEvent = z.infer<typeof BaseEventSchema>
export const BaseEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  start: z.date(),
  end: z.date(),
  status: EventStatusSchema,
  description: z.string(),
  shortDescription: z.string().nullable(),
  imageUrl: z.string().nullable(),
  locationTitle: z.string().nullable(),
  locationAddress: z.string().nullable(),
  locationLink: z.string().nullable(),
  type: EventTypeSchema,
  markForMissedAttendance: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
  attendanceId: z.string().nullable(),
  parentId: z.string().nullable(),
  contestId: z.string().nullable(),
  metadataImportId: z.number().int().nullable(),
})

export type Event = z.infer<typeof EventSchema>
export const EventSchema = BaseEventSchema.extend({
  companies: z.array(CompanySchema),
  hostingGroups: z.array(GroupSchema),
})
export type EventId = Event["id"]
export type EventType = Event["type"]
export type EventStatus = Event["status"]

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
  contestId: true,
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
    excludingChildEvents: z.boolean().default(false),
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

export const DeregisterReasonTypeSchema = z.enum([
  "SCHOOL",
  "WORK",
  "ECONOMY",
  "TIME",
  "SICK",
  "NO_FAMILIAR_FACES",
  "OTHER",
])
export type DeregisterReasonType = z.infer<typeof DeregisterReasonTypeSchema>

export type DeregisterReason = z.infer<typeof DeregisterReasonSchema>
export const DeregisterReasonSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  registeredAt: z.date(),
  type: DeregisterReasonTypeSchema,
  details: z.string().nullable(),
  userGrade: z.number().int().nullable(),
  userId: z.string(),
  eventId: z.string(),
})

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

export function findFirstHostingGroupEmail(event: Event): string | null {
  const validGroupTypes: GroupType[] = ["COMMITTEE", "NODE_COMMITTEE"]
  return event.hostingGroups.filter((group) => group.email && validGroupTypes.includes(group.type)).at(0)?.email ?? null
}
