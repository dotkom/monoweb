import { z } from "zod"

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

export const MembershipSchema = z.object({
  user_id: z.string().ulid(),
  field_of_study: FieldOfStudySchema,
  class_year: z.number().int(),
})

export const MembershipApplicationStatusSchema = z.enum(["PENDING", "ACCEPTED", "REJECTED"])

export const MembershipDocumentationSchema = z.object({
  subjects: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
    })
  ),
  studyPrograms: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
    })
  ),
  studyFields: z.array(z.string()),
})

export const MembershipApplicationSchema = z.object({
  userId: z.string().ulid(),
  fieldOfStudy: FieldOfStudySchema,
  classYear: z.number().int(),
  status: MembershipApplicationStatusSchema,
  preapproved: z.boolean(),
  documentation: MembershipDocumentationSchema,
  comment: z.string().nullable(),
})

export type FieldOfStudy = z.infer<typeof FieldOfStudySchema>
export type Membership = z.infer<typeof MembershipSchema>
export type MembershipApplication = z.infer<typeof MembershipApplicationSchema>
export type MembershipApplicationStatus = z.infer<typeof MembershipApplicationStatusSchema>
export type MembershipDocumentation = z.infer<typeof MembershipDocumentationSchema>
