import { isBefore } from "date-fns"
import { z } from "zod"

export const CommitteeApplicationSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  aboutMe: z.string(),
  userId: z.string(),
  applicationPeriodId: z.string(),
})

export type CommitteeApplication = z.infer<typeof CommitteeApplicationSchema>
export type CommitteeApplicationId = CommitteeApplication["id"]

export const CommitteeApplicationWriteSchema = CommitteeApplicationSchema.pick({
  aboutMe: true,
  userId: true,
  applicationPeriodId: true,
})

export type CommitteeApplicationWrite = z.infer<typeof CommitteeApplicationWriteSchema>

export const CommitteeApplicationPeriodSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  groups: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["EXCLUSIVE", "ADDITIVE"]),
      description: z.string(),
      imageUrl: z.string().nullable(),
    })
  ),
})
export type CommitteeApplicationPeriodSummary = z.infer<typeof CommitteeApplicationPeriodSummarySchema>
export type CommitteeApplicationPeriodId = CommitteeApplicationPeriodSummary["id"]

const InterviewIntervalSchema = z
  .object({ startsAt: z.date(), endsAt: z.date() })
  .refine((interval) => !isBefore(interval.endsAt, interval.startsAt), "Interval end must not precede its start")

export const CommitteeApplicationInterviewMatchingInputSchema = z.object({
  interviewsPublishedAt: z.date(),
  applications: z.array(CommitteeApplicationSchema.pick({ id: true })),
  groups: z.array(z.object({ id: z.string(), interviewDuration: z.enum(["MINUTES_20", "MINUTES_30"]) })),
  groupSelections: z.array(z.object({ id: z.string(), applicationId: z.string(), applicationGroupId: z.string() })),
  availabilityBlocks: z.array(InterviewIntervalSchema.safeExtend({ applicationId: z.string() })),
  interviewBlocks: z.array(
    InterviewIntervalSchema.safeExtend({
      id: z.string(),
      applicationGroupId: z.string(),
      locationName: z.string(),
    })
  ),
})

export type CommitteeApplicationInterviewMatchingInput = z.infer<
  typeof CommitteeApplicationInterviewMatchingInputSchema
>

export const CommitteeApplicationInterviewMatchingResultSchema = z.object({
  solverStatus: z.literal("OPTIMAL"),
  objectiveValue: z.number(),
  totalWantedInterviews: z.number().int().nonnegative(),
  matchedInterviews: z.number().int().nonnegative(),
  interviews: z.array(
    InterviewIntervalSchema.safeExtend({
      groupSelectionId: z.string(),
      applicationGroupId: z.string(),
      interviewBlockId: z.string(),
    })
  ),
})

export type CommitteeApplicationInterviewMatchingResult = z.infer<
  typeof CommitteeApplicationInterviewMatchingResultSchema
>
