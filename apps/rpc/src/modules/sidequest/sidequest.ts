import { buildAnyOfFilter, buildDateRangeFilter, buildSearchFilter, createSortOrder } from "@dotkomonline/utils"
import { compareAsc, isFuture, isPast } from "date-fns"
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
  registerEnd: z.date().nullable(),
  deregisterDeadline: z.date().nullable(),
  description: z.string(),
  imageUrl: z.string().nullable(),
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
  requestedAmountNok: z.int().positive().nullable(),
  expectedAttendeeCount: z.int().positive().nullable(),
  approvedAmountNok: z.int().nonnegative().nullable(),
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
  requestedAmountNok: true,
  expectedAttendeeCount: true,
})

export type SidequestRequestWrite = z.infer<typeof SidequestRequestWriteSchema>

export const SidequestRequestUpdateSchema = SidequestRequestSchema.pick({
  approvedAmountNok: true,
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
    approvedAmountNok: z.int().nonnegative().nullable(),
    reviewNote: z.string().nullable(),
  }),
  z.object({
    status: z.literal("REJECTED"),
    reviewNote: z.string().nullable(),
  }),
])
export type SidequestRequestReviewWrite = z.infer<typeof SidequestRequestReviewWriteSchema>

export const SidequestRegistrationStateSchema = z.object({
  isUserRegistered: z.boolean(),
  isUserInQueue: z.boolean(),
  queuePosition: z.number().int().positive().nullable(),
  isAtCapacity: z.boolean(),
  seatedCount: z.number().int().nonnegative(),
  queuedCount: z.number().int().nonnegative(),
  isRegistrationOpen: z.boolean(),
  isDeregistrationOpen: z.boolean(),
})
export type SidequestRegistrationState = z.infer<typeof SidequestRegistrationStateSchema>

export const SidequestViewSchema = SidequestSummarySchema.extend({
  registrationState: SidequestRegistrationStateSchema,
  seated: SidequestSummarySchema.shape.registrations,
  queue: SidequestSummarySchema.shape.registrations,
})
export type SidequestView = z.infer<typeof SidequestViewSchema>

export const SIDEQUEST_IMAGE_MAX_SIZE_KIB = 5 * 1024 // 5 MiB

export function isUserRegisteredForSidequest(
  userId: string | null,
  sidequest: Pick<SidequestSummary, "registrations">
) {
  if (userId === null) {
    return false
  }

  return sidequest.registrations.some((registration) => registration.userId === userId)
}

export function hasSidequestStarted(sidequest: Pick<Sidequest, "start">) {
  return isPast(sidequest.start)
}

export function hasSidequestEnded(sidequest: Pick<Sidequest, "end">) {
  return isPast(sidequest.end)
}

export function isSidequestRegistrationOpen(sidequest: Pick<Sidequest, "registerEnd" | "start">) {
  if (hasSidequestStarted(sidequest)) {
    return false
  }

  return sidequest.registerEnd === null || isFuture(sidequest.registerEnd)
}

export function isSidequestDeregistrationOpen(sidequest: Pick<Sidequest, "deregisterDeadline" | "start">) {
  if (hasSidequestStarted(sidequest)) {
    return false
  }

  return sidequest.deregisterDeadline === null || isFuture(sidequest.deregisterDeadline)
}

export function getSidequestRegistrationsWithAndWithoutSeat(
  sidequest: Pick<SidequestSummary, "registrations" | "capacity">
) {
  const capacity = sidequest.capacity
  if (capacity === null) {
    return { seated: sidequest.registrations, queue: [] }
  }

  const orderedRegistrations = sidequest.registrations.toSorted((left, right) =>
    compareAsc(left.createdAt, right.createdAt)
  )

  const seated = orderedRegistrations.slice(0, capacity)
  const queue = orderedRegistrations.slice(capacity)

  return { seated, queue }
}

export function isSidequestRegistrationInQueue(
  registration: Pick<SidequestSummary["registrations"][number], "id">,
  sidequest: Pick<SidequestSummary, "registrations" | "capacity">
) {
  const { queue } = getSidequestRegistrationsWithAndWithoutSeat(sidequest)

  return queue.some((queueRegistration) => queueRegistration.id === registration.id)
}

export function getSidequestUserRegistrationState(
  userId: string | null,
  sidequest: Pick<SidequestSummary, "registrations" | "capacity">
) {
  const { seated, queue } = getSidequestRegistrationsWithAndWithoutSeat(sidequest)

  const isUserRegistered = isUserRegisteredForSidequest(userId, sidequest)
  const userRegistration =
    userId !== null ? sidequest.registrations.find((registration) => registration.userId === userId) : undefined
  const isUserInQueue = userRegistration !== undefined && isSidequestRegistrationInQueue(userRegistration, sidequest)

  const queueIndex =
    isUserInQueue && userRegistration !== undefined
      ? queue.findIndex((registration) => registration.id === userRegistration.id)
      : -1

  const isAtCapacity = sidequest.capacity !== null && seated.length >= sidequest.capacity

  return {
    isUserRegistered,
    isUserInQueue,
    queuePosition: queueIndex === -1 ? null : queueIndex + 1,
    isAtCapacity,
  }
}

export function buildSidequestView(sidequest: SidequestSummary, viewerUserId: string | null): SidequestView {
  const { seated, queue } = getSidequestRegistrationsWithAndWithoutSeat(sidequest)
  const registrationState = getSidequestUserRegistrationState(viewerUserId, sidequest)

  return {
    ...sidequest,
    seated,
    queue,
    registrationState: {
      ...registrationState,
      seatedCount: seated.length,
      queuedCount: queue.length,
      isRegistrationOpen: isSidequestRegistrationOpen(sidequest),
      isDeregistrationOpen: isSidequestDeregistrationOpen(sidequest),
    },
  }
}

export function mapSidequestStatusToRequestStatusLabel(status: SidequestStatus) {
  switch (status) {
    case SidequestStatusSchema.enum.IN_REVIEW:
      return "Til vurdering"
    case SidequestStatusSchema.enum.PUBLISHED:
      return "Godkjent"
    case SidequestStatusSchema.enum.REJECTED:
      return "Avvist"
    case SidequestStatusSchema.enum.DELETED:
      return "Slettet"
  }
}
