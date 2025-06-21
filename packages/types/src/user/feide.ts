import z from "zod"

export const FeideResponseGroupSchema = z.object({
  id: z.string(),
  type: z.string(),
  displayName: z.string(),
  parent: z.string().optional(),
  membership: z
    .object({
      basic: z.string(),
      displayName: z.string().optional(),
      notAfter: z.string().optional(),
      notBefore: z.string().optional(),
    })
    .optional(),
})

export type FeideResponseGroup = z.infer<typeof FeideResponseGroupSchema>

export type NTNUGroup = {
  name: string
  code: string
  finished?: Date
}

export type StudentInformation = {
  courses: NTNUGroup[]
  studyProgrammes: NTNUGroup[]
  studySpecializations: NTNUGroup[]
}
