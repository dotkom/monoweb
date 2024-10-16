import { z } from "zod";

export const FeideGroupMembershipSchema = z.object({
  basic: z.string(),
  displayName: z.string().optional(),
  affiliation: z.array(z.string()).optional(),
  primaryAffiliation: z.string().optional(),
  title: z.array(z.string()).optional(),
})

export const FeideGroupSchema = z.object({
  id: z.string(),
  type: z.string(),
  displayName: z.string(),
  membership: FeideGroupMembershipSchema.optional(),
})

export const FeideProfileSchema = z.object({
  norEduPersonLegalName: z.string(),
  uid: z.array(z.string()),
  sn: z.array(z.string()).length(1),
  givenName: z.array(z.string()).length(1),
})

export const FeideDocumentationSchema = z.object({
  subjects: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
      year: z.number().int().optional(),
    })
  ),
  studyProgrammes: z.array(
    z.object({
      code: z.string(),
      name: z.string(),
    })
  ),
  studyFields: z.array(z.string()),
  fullName: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  feideUsername: z.string(),
})

export type FeideGroup = z.infer<typeof FeideGroupSchema>
export type FeideProfile = z.infer<typeof FeideProfileSchema>

export type FeideDocumentation = z.infer<typeof FeideDocumentationSchema>
