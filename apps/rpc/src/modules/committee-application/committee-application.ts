import { tz } from "@date-fns/tz"
import { addDays, isValid, parseISO, startOfDay } from "date-fns"
import { z } from "zod"

export const COMMITTEE_APPLICATION_MAXIMUM_EXCLUSIVE_GROUPS = 3
export const COMMITTEE_APPLICATION_APPLICANT_BUFFER_MINUTES = 15
export const COMMITTEE_APPLICATION_TIME_ZONE = "Europe/Oslo"

export const CommitteeApplicationInterviewIntervalSchema = z
  .object({
    startsAt: z.date(),
    endsAt: z.date(),
  })
  .refine((interval) => interval.startsAt < interval.endsAt, "Interval end must be after its start")

export type CommitteeApplicationInterviewAvailability = z.infer<typeof CommitteeApplicationInterviewIntervalSchema>

export const CommitteeApplicationInterviewDurationSchema = z.enum(["MINUTES_20", "MINUTES_30"])

export type CommitteeApplicationInterviewDuration = z.infer<typeof CommitteeApplicationInterviewDurationSchema>

export const DEFAULT_COMMITTEE_APPLICATION_INTERVIEW_DURATION = CommitteeApplicationInterviewDurationSchema.enum
  .MINUTES_30 satisfies CommitteeApplicationInterviewDuration

export const COMMITTEE_APPLICATION_INTERVIEW_DURATION_MINUTES: Record<CommitteeApplicationInterviewDuration, number> = {
  MINUTES_20: 20,
  MINUTES_30: 30,
}

export const CommitteeApplicationPeriodSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  interviewsPublishedAt: z.date().nullable(),
  name: z.string(),
  isDraft: z.boolean(),
  isEnabled: z.boolean(),
  applicationsOpenAt: z.date(),
  applicationsCloseAt: z.date(),
  interviewsStartDate: z.date(),
  interviewsEndDate: z.date(),
})

export type CommitteeApplicationPeriod = z.infer<typeof CommitteeApplicationPeriodSchema>
export type CommitteeApplicationPeriodId = CommitteeApplicationPeriod["id"]

export const CommitteeApplicationGroupTypeSchema = z.enum(["EXCLUSIVE", "ADDITIVE"])
export type CommitteeApplicationGroupType = z.infer<typeof CommitteeApplicationGroupTypeSchema>

export const CommitteeApplicationGroupSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  applicationPeriodId: z.string(),
  groupId: z.string(),
  type: CommitteeApplicationGroupTypeSchema,
  interviewDuration: CommitteeApplicationInterviewDurationSchema,
})

export type CommitteeApplicationGroup = z.infer<typeof CommitteeApplicationGroupSchema>
export type CommitteeApplicationGroupId = CommitteeApplicationGroup["id"]

export const CommitteeApplicationGroupSelectionSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  applicationId: z.string(),
  applicationPeriodId: z.string(),
  applicationGroupId: z.string(),
  rank: z.int().positive().nullable(),
})

export type CommitteeApplicationGroupSelection = z.infer<typeof CommitteeApplicationGroupSelectionSchema>
export type CommitteeApplicationGroupSelectionId = CommitteeApplicationGroupSelection["id"]

export const CommitteeApplicationAvailabilitySchema = CommitteeApplicationInterviewIntervalSchema.safeExtend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  applicationId: z.string(),
})

export type CommitteeApplicationAvailability = z.infer<typeof CommitteeApplicationAvailabilitySchema>

export const CommitteeApplicationSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  aboutMe: z.string(),
  studyYear: z.int().min(1).max(5).nullable(),
  userId: z.string(),
  applicationPeriodId: z.string(),
  groupSelections: CommitteeApplicationGroupSelectionSchema.array(),
  availabilityBlocks: CommitteeApplicationAvailabilitySchema.array(),
})

export type CommitteeApplication = z.infer<typeof CommitteeApplicationSchema>
export type CommitteeApplicationId = CommitteeApplication["id"]

export const CommitteeApplicationInterviewBlockSchema = CommitteeApplicationInterviewIntervalSchema.safeExtend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  locationName: z.string(),
  locationUrl: z.string().nullable(),
  applicationGroupId: z.string(),
})

export type CommitteeApplicationInterviewBlock = z.infer<typeof CommitteeApplicationInterviewBlockSchema>
export type CommitteeApplicationInterviewBlockId = CommitteeApplicationInterviewBlock["id"]

export const CommitteeApplicationInterviewAssignmentSchema = CommitteeApplicationInterviewIntervalSchema.safeExtend({
  groupSelectionId: z.string(),
  applicationGroupId: z.string(),
  interviewBlockId: z.string(),
})

export type CommitteeApplicationInterviewAssignment = z.infer<typeof CommitteeApplicationInterviewAssignmentSchema>

export const CommitteeApplicationInterviewSchema = CommitteeApplicationInterviewAssignmentSchema.safeExtend({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type CommitteeApplicationInterview = z.infer<typeof CommitteeApplicationInterviewSchema>
export type CommitteeApplicationInterviewId = CommitteeApplicationInterview["id"]

export type CommitteeApplicationInterviewPeriod = Pick<
  CommitteeApplicationPeriod,
  "interviewsStartDate" | "interviewsEndDate"
>

const norwegianTimeContext = { in: tz(COMMITTEE_APPLICATION_TIME_ZONE) }
const startOfNorwegianDate = (date: Date) => parseISO(date.toISOString().slice(0, 10), norwegianTimeContext)

export function getInterviewDays(applicationPeriod: CommitteeApplicationInterviewPeriod) {
  return {
    startsAt: startOfNorwegianDate(applicationPeriod.interviewsStartDate),
    endsAt: addDays(startOfNorwegianDate(applicationPeriod.interviewsEndDate), 1, norwegianTimeContext),
  }
}

export function getInterviewWindow(time: Date) {
  const startsAt = startOfDay(time, norwegianTimeContext)

  return { startsAt, endsAt: addDays(startsAt, 1, norwegianTimeContext) }
}

export function isInterviewAvailabilityValid(
  availability: CommitteeApplicationInterviewAvailability,
  applicationPeriod: CommitteeApplicationInterviewPeriod
): boolean {
  const interviewDays = getInterviewDays(applicationPeriod)

  return (
    isValid(availability.startsAt) &&
    isValid(availability.endsAt) &&
    availability.startsAt < availability.endsAt &&
    availability.startsAt >= interviewDays.startsAt &&
    availability.endsAt <= interviewDays.endsAt &&
    availability.endsAt <= getInterviewWindow(availability.startsAt).endsAt
  )
}

export const CommitteeApplicationGroupConfigurationSchema = CommitteeApplicationGroupSchema.pick({
  groupId: true,
  type: true,
}).extend({
  interviewDuration: CommitteeApplicationInterviewDurationSchema.default(
    DEFAULT_COMMITTEE_APPLICATION_INTERVIEW_DURATION
  ),
})

export type CommitteeApplicationGroupConfiguration = z.infer<typeof CommitteeApplicationGroupConfigurationSchema>

export const CommitteeApplicationPeriodConfigurationSchema = CommitteeApplicationPeriodSchema.pick({
  name: true,
  isDraft: true,
  isEnabled: true,
  applicationsOpenAt: true,
  applicationsCloseAt: true,
  interviewsStartDate: true,
  interviewsEndDate: true,
}).extend({
  name: z.string().trim().min(2),
})

export type CommitteeApplicationPeriodConfiguration = z.infer<typeof CommitteeApplicationPeriodConfigurationSchema>

export const CommitteeApplicationPeriodCreateSchema = z.object({
  applicationPeriod: CommitteeApplicationPeriodConfigurationSchema,
  groups: CommitteeApplicationGroupConfigurationSchema.array().min(1),
})

export type CommitteeApplicationPeriodCreate = z.infer<typeof CommitteeApplicationPeriodCreateSchema>

export const CommitteeApplicationPeriodUpdateSchema = z.object({
  applicationPeriod: CommitteeApplicationPeriodConfigurationSchema.partial(),
  groups: CommitteeApplicationGroupConfigurationSchema.array().min(1).optional(),
})

export type CommitteeApplicationPeriodUpdate = z.infer<typeof CommitteeApplicationPeriodUpdateSchema>

export const CommitteeApplicationUpdateSchema = z.object({
  aboutMe: z.string().trim().min(1, "Skriv kort om deg selv."),
  studyYear: z.int().min(1).max(5),
  groupSelections: z
    .array(
      z.object({
        applicationGroupId: z.string().min(1),
        rank: z.int().positive().nullable(),
      })
    )
    .min(1),
  interviewAvailability: CommitteeApplicationInterviewIntervalSchema.array().min(1),
})

export type CommitteeApplicationUpdate = z.infer<typeof CommitteeApplicationUpdateSchema>

export const CommitteeApplicationSubmitSchema = CommitteeApplicationUpdateSchema.extend({
  applicationPeriodId: z.string().min(1),
})

export type CommitteeApplicationSubmit = z.infer<typeof CommitteeApplicationSubmitSchema>

export const CommitteeApplicationInterviewBlockInputSchema = CommitteeApplicationInterviewIntervalSchema.safeExtend({
  id: CommitteeApplicationInterviewBlockSchema.shape.id,
  locationName: z.string().trim(),
  locationUrl: z.string().trim().nullable(),
})

export type CommitteeApplicationInterviewBlockInput = z.infer<typeof CommitteeApplicationInterviewBlockInputSchema>
export const CommitteeApplicationInterviewBlocksSetSchema = z.object({
  interviewDuration: CommitteeApplicationInterviewDurationSchema,
  interviewBlocks: CommitteeApplicationInterviewBlockInputSchema.array(),
})
export type CommitteeApplicationInterviewBlocksSet = z.infer<typeof CommitteeApplicationInterviewBlocksSetSchema>

export const CommitteeApplicationInterviewPlacementSchema = CommitteeApplicationInterviewIntervalSchema.safeExtend({
  interviewBlockId: z.string().min(1),
})

export type CommitteeApplicationInterviewPlacement = z.infer<typeof CommitteeApplicationInterviewPlacementSchema>

export const CommitteeApplicationOpenPeriodSchema = CommitteeApplicationPeriodSchema.pick({
  id: true,
  name: true,
  applicationsCloseAt: true,
  interviewsStartDate: true,
  interviewsEndDate: true,
}).extend({
  groups: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: CommitteeApplicationGroupSchema.shape.type,
      description: z.string(),
      imageUrl: z.string().nullable(),
    })
  ),
})

export type CommitteeApplicationOpenPeriod = z.infer<typeof CommitteeApplicationOpenPeriodSchema>

export const CommitteeApplicationGroupStatusSchema = CommitteeApplicationGroupSchema.extend({
  interviewBlockCount: z.int().nonnegative(),
  interviewBlocksUpdatedAt: z.date().nullable(),
  hasAllValidRooms: z.boolean(),
  interviewMinutes: z.int().nonnegative(),
})

export type CommitteeApplicationGroupStatus = z.infer<typeof CommitteeApplicationGroupStatusSchema>

export const CommitteeApplicationInterviewAttendeeSchema = z.object({
  userId: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable(),
})

export type CommitteeApplicationInterviewAttendee = z.infer<typeof CommitteeApplicationInterviewAttendeeSchema>

export const CommitteeApplicationUnmatchedApplicantSchema = z.object({
  groupSelectionId: z.string(),
  applicationId: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  rank: CommitteeApplicationGroupSelectionSchema.shape.rank,
  availability: CommitteeApplicationInterviewIntervalSchema.array(),
})

export type CommitteeApplicationUnmatchedApplicant = z.infer<typeof CommitteeApplicationUnmatchedApplicantSchema>

export const CommitteeApplicationMatchedInterviewSchema = CommitteeApplicationInterviewIntervalSchema.safeExtend({
  id: z.string(),
  groupSelectionId: z.string(),
  interviewBlockId: z.string(),
  applicationId: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  rank: CommitteeApplicationGroupSelectionSchema.shape.rank,
  locationName: z.string(),
  locationUrl: z.string().nullable(),
  availability: CommitteeApplicationInterviewIntervalSchema.array(),
  attendees: CommitteeApplicationInterviewAttendeeSchema.array(),
})

export type CommitteeApplicationMatchedInterview = z.infer<typeof CommitteeApplicationMatchedInterviewSchema>

export const CommitteeApplicationGroupMatchingSchema = z.object({
  groupId: z.string(),
  applicationGroupId: z.string(),
  totalApplicants: z.int().nonnegative(),
  matchedApplicants: z.int().nonnegative(),
  matchedInterviews: CommitteeApplicationMatchedInterviewSchema.array(),
  unmatchedApplicants: CommitteeApplicationUnmatchedApplicantSchema.array(),
})

export type CommitteeApplicationGroupMatching = z.infer<typeof CommitteeApplicationGroupMatchingSchema>

export const CommitteeApplicationInterviewScheduleSchema = z.object({
  applicationPeriodId: z.string(),
  interviewsPublishedAt: z.date().nullable(),
  totalWantedInterviews: z.int().nonnegative(),
  matchedInterviews: z.int().nonnegative(),
  groups: CommitteeApplicationGroupMatchingSchema.array(),
})

export type CommitteeApplicationInterviewSchedule = z.infer<typeof CommitteeApplicationInterviewScheduleSchema>

export const CommitteeApplicationApplicantViewSchema = CommitteeApplicationSchema.extend({
  applicationPeriodName: z.string(),
  applicationsCloseAt: z.date(),
  interviewsPublishedAt: z.date().nullable(),
  groups: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      rank: z.int().positive().nullable(),
      interview: CommitteeApplicationInterviewIntervalSchema.safeExtend({
        id: z.string(),
        locationName: z.string(),
        locationUrl: z.string().nullable(),
      }).nullable(),
    })
  ),
})

export type CommitteeApplicationApplicantView = z.infer<typeof CommitteeApplicationApplicantViewSchema>

export const CommitteeApplicationApplicantDetailsSchema = z.object({
  applicationId: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  studyYear: z.int().nullable(),
  aboutMe: z.string(),
  createdAt: z.date(),
  availability: CommitteeApplicationInterviewIntervalSchema.array(),
  groupSelections: z.array(
    z.object({
      applicationGroupId: CommitteeApplicationGroupSchema.shape.id,
      groupId: CommitteeApplicationGroupSchema.shape.groupId,
      rank: CommitteeApplicationGroupSelectionSchema.shape.rank,
      interview: CommitteeApplicationInterviewIntervalSchema.safeExtend({
        locationName: z.string(),
        locationUrl: z.string().nullable(),
        attendees: CommitteeApplicationInterviewAttendeeSchema.array(),
      }).nullable(),
    })
  ),
})

export type CommitteeApplicationApplicantDetails = z.infer<typeof CommitteeApplicationApplicantDetailsSchema>

export const CommitteeApplicationInterviewMatchingInputSchema = z.object({
  publicationReferenceTime: z.date(),
  applications: z.array(z.object({ id: z.string() })),
  groups: CommitteeApplicationGroupSchema.pick({ id: true, interviewDuration: true }).array(),
  groupSelections: CommitteeApplicationGroupSelectionSchema.pick({
    id: true,
    applicationId: true,
    applicationGroupId: true,
  }).array(),
  availabilityBlocks: CommitteeApplicationInterviewIntervalSchema.safeExtend({ applicationId: z.string() }).array(),
  interviewBlocks: CommitteeApplicationInterviewIntervalSchema.safeExtend({
    id: z.string(),
    applicationGroupId: z.string(),
    locationName: z.string(),
  }).array(),
})

export type CommitteeApplicationInterviewMatchingInput = z.infer<
  typeof CommitteeApplicationInterviewMatchingInputSchema
>

export const CommitteeApplicationInterviewMatchingResultSchema = z.object({
  solverStatus: z.literal("OPTIMAL"),
  objectiveValue: z.number(),
  totalWantedInterviews: z.int().nonnegative(),
  matchedInterviews: z.int().nonnegative(),
  interviews: CommitteeApplicationInterviewAssignmentSchema.array(),
})

export type CommitteeApplicationInterviewMatchingResult = z.infer<
  typeof CommitteeApplicationInterviewMatchingResultSchema
>

export type CommitteeApplicationInterviewMatcher = (
  input: CommitteeApplicationInterviewMatchingInput
) => Promise<{ interviews: CommitteeApplicationInterviewAssignment[] }>
