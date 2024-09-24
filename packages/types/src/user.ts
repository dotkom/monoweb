import { z } from "zod"

export const UserMetadataSchema = z.object({
  email: z.string().email(),
  phone: z.string().nullable(),
  gender: z.enum(["male", "female", "other"]),
  allergies: z.array(z.string()),
  picture_url: z.string().nullable(),
  study_start_year: z.number().int(),
})

export const AppMetadataSchema = z.object({
  ow_user_id: z.string(),
})

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  image: z.string().nullable(),
  emailVerified: z.boolean(),
  metadata: UserMetadataSchema.nullable(),
  app_metadata: AppMetadataSchema.nullable(),
})

export type User = z.infer<typeof UserSchema>
export type UserMetadata = z.infer<typeof UserMetadataSchema>
export type AppMetadata = z.infer<typeof AppMetadataSchema>

export type UserMetadataWrite = z.infer<typeof UserMetadataSchema>
export type AppMetadataWrite = z.infer<typeof AppMetadataSchema>

export type UserId = User["id"]
