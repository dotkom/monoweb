import { z } from "zod"
import { FeideDocumentationSchema } from "./feide"

export const OnlineFieldsOfStudy = [
  "BACHELOR_INFORMATICS",
  "MASTER_INFORMATICS",
  "PHD"
] as const

export const OnlineFieldOfStudySchema = z.enum(OnlineFieldsOfStudy)

export const MasterSpecializations = [
  "SOFTWARE_ENGINEERING",
  "DATABASE_AND_SEARCH",
  "ALGORITHMS",
  "GAME_TECHNOLOGY",
  "ARTIFICIAL_INTELLIGENCE",
  "HEALTH_INFORMATICS",
  "INTERACTION_DESIGN",
  "OTHER",
] as const

export const MasterSpecializationsSchema = z.enum(MasterSpecializations)

export const MembershipSchema = z.object({
  onlineFieldOfStudy: OnlineFieldOfStudySchema.nullable(),
  classYear: z.number().int(),

  // Used to grant social membership to non-BIT/MSIT students
  // (https://github.com/dotkom/Onlines_Vedtekter/blob/3b4bd1836b2f899478c2029ba6ca6e82733528d9/vedtekter.adoc#34-adgang-for-andre-til-%C3%A5-bli-sosialt-medlem)
  socialMembership: z.boolean(),

  // Used to grant exceptional full membership to non-BIT/MSIT students
  // (https://github.com/dotkom/Onlines_Vedtekter/blob/3b4bd1836b2f899478c2029ba6ca6e82733528d9/vedtekter.adoc#35-adgang-for-andre-til-%C3%A5-bli-fullverdig-medlem)
  extraordinaryFullMembership: z.boolean(),

  // Used to identify external users, and what student organization they belong to
  studyprogrammeCodes: z.array(z.string()),
})

export const MembershipApplicationStatusSchema = z.enum(["PENDING", "ACCEPTED", "REJECTED"])

export const MembershipApplicationSchema = z.object({
  userId: z.string().ulid(),
  classYear: z.number().int(),
  socialMembership: z.boolean(),
  documentation: FeideDocumentationSchema,
  comment: z.string(),
})

export type Membership = z.infer<typeof MembershipSchema>

export type MembershipApplication = z.infer<typeof MembershipApplicationSchema>
export type MembershipApplicationStatus = z.infer<typeof MembershipApplicationStatusSchema>

export type MembershipDocumentation = z.infer<typeof FeideDocumentationSchema>

export type OnlineFieldOfStudy = z.infer<typeof OnlineFieldOfStudySchema>
export type MasterSpecialization = z.infer<typeof MasterSpecializationsSchema>
