import { z } from "zod"
import { FeideDocumentationSchema } from "./feide"

export const FieldOfStudySchema = z.enum([
  "BACHELOR",

  "MASTER_SOFTWARE_ENGINEERING",
  "MASTER_DATABASE_AND_SEARCH",
  "MASTER_ALGORITHMS",
  "MASTER_GAME_TECHNOLOGY",
  "MASTER_ARTIFICIAL_INTELLIGENCE",
  "MASTER_HEALTH_INFORMATICS",
  "MASTER_INTERACTION_DESIGN",
  "MASTER_OTHER",

  "SOCIAL_MEMBER",
  "PHD",
  "INTERNATIONAL",
  "OTHER_MEMBER",
])

export const isMaster = (fieldOfStudy: FieldOfStudy): boolean => {
  return [
    "MASTER_SOFTWARE_ENGINEERING",
    "MASTER_DATABASE_AND_SEARCH",
    "MASTER_ALGORITHMS",
    "MASTER_GAME_TECHNOLOGY",
    "MASTER_ARTIFICIAL_INTELLIGENCE",
    "MASTER_HEALTH_INFORMATICS",
    "MASTER_INTERACTION_DESIGN",
    "MASTER_OTHER",
  ].includes(fieldOfStudy)
}

export const MembershipSchema = z.object({
  fieldOfStudy: FieldOfStudySchema,
  classYear: z.number().int(),
})

export const MembershipApplicationStatusSchema = z.enum(["PENDING", "ACCEPTED", "REJECTED"])

export const MembershipApplicationSchema = z.object({
  userId: z.string().ulid(),
  fieldOfStudy: FieldOfStudySchema,
  classYear: z.number().int(),
  status: MembershipApplicationStatusSchema,
  preapproved: z.boolean(),
  documentation: FeideDocumentationSchema,
  comment: z.string().nullable(),
})

export type FieldOfStudy = z.infer<typeof FieldOfStudySchema>

export type Membership = z.infer<typeof MembershipSchema>

export type MembershipApplication = z.infer<typeof MembershipApplicationSchema>
export type MembershipApplicationStatus = z.infer<typeof MembershipApplicationStatusSchema>

export type MembershipDocumentation = z.infer<typeof FeideDocumentationSchema>
