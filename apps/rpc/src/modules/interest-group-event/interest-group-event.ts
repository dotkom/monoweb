import { buildAnyOfFilter, buildDateRangeFilter, buildSearchFilter, createSortOrder } from "@dotkomonline/utils"
import { compareAsc, isPast } from "date-fns"
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
  imageUrl: z.string().nullable(),
  locationTitle: z.string().nullable(),
  locationAddress: z.string().nullable(),
  locationLink: z.string().nullable(),
  registrations: z.array(InterestGroupEventRegistrationSchema),
  interestGroupId: z.string(),
  interestGroup: GroupSchema,
  status: InterestGroupEventStatusSchema,
  capacity: z.number().nullable(),
})

export type InterestGroupEvent = z.infer<typeof InterestGroupEventSchema>
export type InterestGroupEventId = InterestGroupEvent["id"]

export const InterestGroupEventSummarySchema = InterestGroupEventSchema.omit({ registrations: true }).extend({
  registrations: z.array(
    InterestGroupEventRegistrationSchema.extend({
      user: InterestGroupEventRegistrationUserSchema.nullable(),
      userId: z.string().nullable(),
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
  capacity: true,
})

export type InterestGroupEventWrite = z.infer<typeof InterestGroupEventWriteSchema>

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

export const INTEREST_GROUP_EVENT_IMAGE_MAX_SIZE_KIB = 1024 * 5

export function isUserRegisteredForInterestGroupEvent(
  userId: string | null,
  interestGroupEvent: Pick<InterestGroupEventSummary, "registrations">
) {
  if (userId === null) {
    return false
  }

  return interestGroupEvent.registrations.some((registration) => registration.userId === userId)
}

export function isInterestGroupEventEnded(interestGroupEvent: Pick<InterestGroupEvent, "end">) {
  return isPast(interestGroupEvent.end)
}

export function isInterestGroupEventRegistrationOpen(interestGroupEvent: Pick<InterestGroupEvent, "registerEnd">) {
  return !isPast(interestGroupEvent.registerEnd)
}

export function isInterestGroupEventDeregistrationOpen(
  interestGroupEvent: Pick<InterestGroupEvent, "deregisterDeadline">
) {
  return !isPast(interestGroupEvent.deregisterDeadline)
}

export function getInterestGroupEventRegistrationsWithAndWithoutSpot(
  interestGroupEvent: Pick<InterestGroupEventSummary, "registrations" | "capacity">
) {
  const capacity = interestGroupEvent.capacity
  if (capacity === null) {
    return { registrationsWithSpot: interestGroupEvent.registrations, waitlist: [] }
  }

  const orderedRegistrations = interestGroupEvent.registrations.toSorted((left, right) =>
    compareAsc(left.createdAt, right.createdAt)
  )

  const registrationsWithSpot = orderedRegistrations.slice(0, capacity)
  const waitlist = orderedRegistrations.slice(capacity)

  return { registrationsWithSpot, waitlist }
}

export function doesInterestGroupEventRegistrationHaveASpot(
  registration: Pick<InterestGroupEventSummary["registrations"][number], "id">,
  interestGroupEvent: Pick<InterestGroupEventSummary, "registrations" | "capacity">
) {
  const { registrationsWithSpot } = getInterestGroupEventRegistrationsWithAndWithoutSpot(interestGroupEvent)

  return registrationsWithSpot.some((registrationWithSpot) => registrationWithSpot.id === registration.id)
}

export function isInterestGroupEventRegistrationOnWaitlist(
  registration: Pick<InterestGroupEventSummary["registrations"][number], "id">,
  interestGroupEvent: Pick<InterestGroupEventSummary, "registrations" | "capacity">
) {
  const { waitlist } = getInterestGroupEventRegistrationsWithAndWithoutSpot(interestGroupEvent)

  return waitlist.some((waitlistRegistration) => waitlistRegistration.id === registration.id)
}

export function getInterestGroupEventUserRegistrationState(
  userId: string | null,
  interestGroupEvent: Pick<InterestGroupEventSummary, "registrations" | "capacity">
) {
  const { registrationsWithSpot, waitlist } = getInterestGroupEventRegistrationsWithAndWithoutSpot(interestGroupEvent)

  const isUserRegistered = isUserRegisteredForInterestGroupEvent(userId, interestGroupEvent)
  const userRegistration =
    userId !== null
      ? interestGroupEvent.registrations.find((registration) => registration.userId === userId)
      : undefined
  const isUserOnWaitlist =
    userRegistration !== undefined && isInterestGroupEventRegistrationOnWaitlist(userRegistration, interestGroupEvent)

  const waitlistIndex =
    isUserOnWaitlist && userRegistration !== undefined
      ? waitlist.findIndex((registration) => registration.id === userRegistration.id)
      : -1

  const isAtCapacity =
    interestGroupEvent.capacity !== null && registrationsWithSpot.length >= interestGroupEvent.capacity

  return {
    isUserRegistered,
    isUserOnWaitlist,
    waitlistPosition: waitlistIndex === -1 ? null : waitlistIndex + 1,
    isAtCapacity,
  }
}
