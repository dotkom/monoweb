import { buildAnyOfFilter, buildDateRangeFilter, buildSearchFilter, createSortOrder } from "@dotkomonline/utils"
import { z } from "zod"
import { GroupSchema } from "../group/group"
import { UserSchema } from "../user/user"

export const InterestGroupEventStatusSchema = z.enum(["IN_REVIEW", "PUBLISHED", "REJECTED", "DELETED"])
export type InterestGroupEventStatus = z.infer<typeof InterestGroupEventStatusSchema>

export const InterestGroupEventRegistrationUserSchema = UserSchema.pick({
  id: true,
  username: true,
  name: true,
  imageUrl: true,
})
export type InterestGroupEventRegistrationUser = z.infer<typeof InterestGroupEventRegistrationUserSchema>

export const InterestGroupEventRegistrationSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  userId: z.string(),
  interestGroupEventId: z.string(),
  user: InterestGroupEventRegistrationUserSchema,
})

export type InterestGroupEventRegistration = z.infer<typeof InterestGroupEventRegistrationSchema>
export type InterestGroupEventRegistrationId = InterestGroupEventRegistration["id"]

export const InterestGroupEventSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string(),
  start: z.date(),
  end: z.date(),
  registerEnd: z.date(),
  deregisterDeadline: z.date(),
  description: z.string(),
  imageUrl: z.string(),
  locationTitle: z.string().nullable(),
  locationAddress: z.string().nullable(),
  locationLink: z.string().nullable(),
  registrations: z.array(InterestGroupEventRegistrationSchema),
  interestGroupId: z.string(),
  interestGroup: GroupSchema,
  status: InterestGroupEventStatusSchema,
})

export type InterestGroupEvent = z.infer<typeof InterestGroupEventSchema>
export type InterestGroupEventId = InterestGroupEvent["id"]

export const InterestGroupEventSummarySchema = InterestGroupEventSchema.omit({ registrations: true }).extend({
  registrations: z.array(
    InterestGroupEventRegistrationSchema.extend({
      user: InterestGroupEventRegistrationUserSchema.nullable(),
    })
  ),
})
export type InterestGroupEventSummary = z.infer<typeof InterestGroupEventSummarySchema>

export const InterestGroupEventWriteSchema = InterestGroupEventSchema.pick({
  title: true,
  start: true,
  end: true,
  registerEnd: true,
  deregisterDeadline: true,
  description: true,
  imageUrl: true,
  locationTitle: true,
  locationAddress: true,
  locationLink: true,
  interestGroupId: true,
  status: true,
})

export type InterestGroupEventWrite = z.infer<typeof InterestGroupEventWriteSchema>

export const RequestedInterestGroupEventWriteSchema = InterestGroupEventWriteSchema.pick({
  title: true,
  start: true,
  end: true,
  registerEnd: true,
  deregisterDeadline: true,
  description: true,
  imageUrl: true,
  locationTitle: true,
  locationAddress: true,
  locationLink: true,
})

export type RequestedInterestGroupEventWrite = z.infer<typeof RequestedInterestGroupEventWriteSchema>

export const InterestGroupEventRequestSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  description: z.string().nullable(),
  requestedAmount: z.int().positive(),
  expectedAttendeeCount: z.int().positive(),
  approvedAmount: z.int().nonnegative().nullable(),
  reviewedAt: z.date().nullable(),
  reviewNote: z.string().nullable(),
  interestGroupEventId: z.string(),
  requestedById: z.string(),
  reviewedById: z.string().nullable(),
})

export type InterestGroupEventRequest = z.infer<typeof InterestGroupEventRequestSchema>
export type InterestGroupEventRequestId = InterestGroupEventRequest["id"]

export const InterestGroupEventRequestWriteSchema = InterestGroupEventRequestSchema.pick({
  description: true,
  requestedAmount: true,
  expectedAttendeeCount: true,
})

export type InterestGroupEventRequestWrite = z.infer<typeof InterestGroupEventRequestWriteSchema>

export const InterestGroupEventRequestUpdateSchema = InterestGroupEventRequestSchema.pick({
  approvedAmount: true,
  reviewNote: true,
  reviewedById: true,
  reviewedAt: true,
})
export type InterestGroupEventRequestUpdate = z.infer<typeof InterestGroupEventRequestUpdateSchema>

export const InterestGroupEventFilterQuerySchema = z
  .object({
    byInterestGroupId: buildAnyOfFilter(GroupSchema.shape.slug),
    byStatus: buildAnyOfFilter(InterestGroupEventStatusSchema),
    byStartDate: buildDateRangeFilter(),
    byEndDate: buildDateRangeFilter(),
    bySearchTerm: buildSearchFilter(),
    orderBy: createSortOrder(),
  })
  .partial()
export type InterestGroupEventFilterQuery = z.infer<typeof InterestGroupEventFilterQuerySchema>

export const InterestGroupEventSummaryWithRequestSchema = InterestGroupEventSummarySchema.extend({
  request: InterestGroupEventRequestSchema.nullable(),
})
export type InterestGroupEventSummaryWithRequest = z.infer<typeof InterestGroupEventSummaryWithRequestSchema>

export const InterestGroupEventRequestReviewWriteSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("PUBLISHED"),
    approvedAmount: z.int().nonnegative(),
    reviewNote: z.string().nullable(),
  }),
  z.object({
    status: z.literal("REJECTED"),
    reviewNote: z.string().nullable(),
  }),
])
export type InterestGroupEventRequestReviewWrite = z.infer<typeof InterestGroupEventRequestReviewWriteSchema>

export const INTEREST_GROUP_EVENT_IMAGE_MAX_SIZE_KIB = 5 * 1024

export function isUserRegisteredForInterestGroupEvent(
  userId: string | null,
  interestGroupEvent: Pick<InterestGroupEventSummary, "registrations">
) {
  return interestGroupEvent.registrations.some((registration) => registration.userId === userId)
}

export function mapInterestGroupEventStatusToRequestStatusLabel(status: InterestGroupEventStatus) {
  switch (status) {
    case "IN_REVIEW":
      return "Til vurdering"
    case "PUBLISHED":
      return "Godkjent og publisert"
    case "REJECTED":
      return "Avvist"
    case "DELETED":
      return "Slettet"
  }
}
