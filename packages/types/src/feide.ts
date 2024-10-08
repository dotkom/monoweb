import { z } from "zod";

export const FeideDocumentationSchema = z.object({
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
  fullName: z.string(),
  givenName: z.string(),
  familyName: z.string(),
  feideUsername: z.string(),
})

export type FeideDocumentation = z.infer<typeof FeideDocumentationSchema>
