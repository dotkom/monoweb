import { buildAnyOfFilter, buildDateRangeFilter, buildSearchFilter, createSortOrder } from "@dotkomonline/utils"
import { compareAsc, isPast } from "date-fns"
import { z } from "zod"
import { GroupSchema } from "../group/group"
import { UserSchema } from "../user/user"

export const SidequestStatusSchema = z.enum(["IN_REVIEW", "PUBLISHED", "REJECTED", "DELETED"])
export type SidequestStatus = z.infer<typeof SidequestStatusSchema>

export const SidequestRegistrationUserSchema = UserSchema.pick({
  id: true,
  username: true,
  name: true,
  imageUrl: true,
})
export type SidequestRegistrationUser = z.infer<typeof SidequestRegistrationUserSchema>

export const SidequestRegistrationSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  userId: z.string(),
  sidequestId: z.string(),
  user: SidequestRegistrationUserSchema,
})

export type SidequestRegistration = z.infer<typeof SidequestRegistrationSchema>
export type SidequestRegistrationId = SidequestRegistration["id"]

export const SidequestSchema = z.object({
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
  registrations: z.array(SidequestRegistrationSchema),
  interestGroupId: z.string(),
  interestGroup: GroupSchema,
  status: SidequestStatusSchema,
  capacity: z.number().nullable(),
})

export type Sidequest = z.infer<typeof SidequestSchema>
export type SidequestId = Sidequest["id"]

export const SidequestSummarySchema = SidequestSchema.omit({ registrations: true }).extend({
  registrations: z.array(
    SidequestRegistrationSchema.extend({
      user: SidequestRegistrationUserSchema.nullable(),
      userId: z.string().nullable(),
    })
  ),
})
export type SidequestSummary = z.infer<typeof SidequestSummarySchema>

export const SidequestWriteSchema = SidequestSchema.pick({
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

export type SidequestWrite = z.infer<typeof SidequestWriteSchema>

export const RequestedSidequestWriteSchema = SidequestWriteSchema.pick({
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
  capacity: true,
})

export type RequestedSidequestWrite = z.infer<typeof RequestedSidequestWriteSchema>

export const SidequestRequestSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  description: z.string().nullable(),
  requestedAmount: z.int().positive(),
  expectedAttendeeCount: z.int().positive(),
  approvedAmount: z.int().nonnegative().nullable(),
  reviewedAt: z.date().nullable(),
  reviewNote: z.string().nullable(),
  sidequestId: z.string(),
  requestedById: z.string(),
  reviewedById: z.string().nullable(),
})

export type SidequestRequest = z.infer<typeof SidequestRequestSchema>
export type SidequestRequestId = SidequestRequest["id"]

export const SidequestRequestWriteSchema = SidequestRequestSchema.pick({
  description: true,
  requestedAmount: true,
  expectedAttendeeCount: true,
})

export type SidequestRequestWrite = z.infer<typeof SidequestRequestWriteSchema>

export const SidequestRequestUpdateSchema = SidequestRequestSchema.pick({
  approvedAmount: true,
  reviewNote: true,
  reviewedById: true,
  reviewedAt: true,
})
export type SidequestRequestUpdate = z.infer<typeof SidequestRequestUpdateSchema>

export const SidequestFilterQuerySchema = z
  .object({
    byInterestGroupId: buildAnyOfFilter(GroupSchema.shape.slug),
    byStatus: buildAnyOfFilter(SidequestStatusSchema),
    byStartDate: buildDateRangeFilter(),
    byEndDate: buildDateRangeFilter(),
    bySearchTerm: buildSearchFilter(),
    orderBy: createSortOrder(),
  })
  .partial()
export type SidequestFilterQuery = z.infer<typeof SidequestFilterQuerySchema>

export const SidequestSummaryWithRequestSchema = SidequestSummarySchema.extend({
  request: SidequestRequestSchema.nullable(),
})
export type SidequestSummaryWithRequest = z.infer<typeof SidequestSummaryWithRequestSchema>

export const SidequestRequestReviewWriteSchema = z.discriminatedUnion("status", [
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
export type SidequestRequestReviewWrite = z.infer<typeof SidequestRequestReviewWriteSchema>

export const SIDEQUEST_IMAGE_MAX_SIZE_KIB = 5 * 1024

export function isUserRegisteredForSidequest(
  userId: string | null,
  sidequest: Pick<SidequestSummary, "registrations">
) {
  if (userId === null) {
    return false
  }

  return sidequest.registrations.some((registration) => registration.userId === userId)
}

export function hasSidequestEnded(sidequest: Pick<Sidequest, "end">) {
  return isPast(sidequest.end)
}

export function isSidequestRegistrationOpen(sidequest: Pick<Sidequest, "registerEnd">) {
  return !isPast(sidequest.registerEnd)
}

export function isSidequestDeregistrationOpen(sidequest: Pick<Sidequest, "deregisterDeadline">) {
  return !isPast(sidequest.deregisterDeadline)
}

export function getSidequestRegistrationsWithAndWithoutSpot(
  sidequest: Pick<SidequestSummary, "registrations" | "capacity">
) {
  const capacity = sidequest.capacity
  if (capacity === null) {
    return { registrationsWithSpot: sidequest.registrations, waitlist: [] }
  }

  const orderedRegistrations = sidequest.registrations.toSorted((left, right) =>
    compareAsc(left.createdAt, right.createdAt)
  )

  const registrationsWithSpot = orderedRegistrations.slice(0, capacity)
  const waitlist = orderedRegistrations.slice(capacity)

  return { registrationsWithSpot, waitlist }
}

export function doesSidequestRegistrationHaveASpot(
  registration: Pick<SidequestSummary["registrations"][number], "id">,
  sidequest: Pick<SidequestSummary, "registrations" | "capacity">
) {
  const { registrationsWithSpot } = getSidequestRegistrationsWithAndWithoutSpot(sidequest)

  return registrationsWithSpot.some((registrationWithSpot) => registrationWithSpot.id === registration.id)
}

export function isSidequestRegistrationOnWaitlist(
  registration: Pick<SidequestSummary["registrations"][number], "id">,
  sidequest: Pick<SidequestSummary, "registrations" | "capacity">
) {
  const { waitlist } = getSidequestRegistrationsWithAndWithoutSpot(sidequest)

  return waitlist.some((waitlistRegistration) => waitlistRegistration.id === registration.id)
}

export function getSidequestUserRegistrationState(
  userId: string | null,
  sidequest: Pick<SidequestSummary, "registrations" | "capacity">
) {
  const { registrationsWithSpot, waitlist } = getSidequestRegistrationsWithAndWithoutSpot(sidequest)

  const isUserRegistered = isUserRegisteredForSidequest(userId, sidequest)
  const userRegistration =
    userId !== null ? sidequest.registrations.find((registration) => registration.userId === userId) : undefined
  const isUserOnWaitlist =
    userRegistration !== undefined && isSidequestRegistrationOnWaitlist(userRegistration, sidequest)

  const waitlistIndex =
    isUserOnWaitlist && userRegistration !== undefined
      ? waitlist.findIndex((registration) => registration.id === userRegistration.id)
      : -1

  const isAtCapacity = sidequest.capacity !== null && registrationsWithSpot.length >= sidequest.capacity

  return {
    isUserRegistered,
    isUserOnWaitlist,
    waitlistPosition: waitlistIndex === -1 ? null : waitlistIndex + 1,
    isAtCapacity,
  }
}

export function mapSidequestStatusToRequestStatusLabel(status: SidequestStatus) {
  switch (status) {
    case SidequestStatusSchema.enum.IN_REVIEW:
      return "Til vurdering"
    case SidequestStatusSchema.enum.PUBLISHED:
      return "Godkjent og publisert"
    case SidequestStatusSchema.enum.REJECTED:
      return "Avvist"
    case SidequestStatusSchema.enum.DELETED:
      return "Slettet"
  }
}
