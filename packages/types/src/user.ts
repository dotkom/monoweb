import { z } from "zod"

export const UserMetadataSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  gender: z.enum(["male", "female", "other"]),
  allergies: z.array(z.string()),
  picture_: z.string().nullable(),
})

export const AppMetadataSchema = z.object({
  ow_user_id: z.string(),
})

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  metadata: UserMetadataSchema.optional(),
  app_metadata: AppMetadataSchema.optional(),
})

export type User = z.infer<typeof UserSchema>
export type UserMetadata = z.infer<typeof UserMetadataSchema>
export type AppMetadata = z.infer<typeof AppMetadataSchema>

export type UserMetadataWrite = z.infer<typeof UserMetadataSchema>
export type AppMetadataWrite = z.infer<typeof AppMetadataSchema>

export type UserId = User["id"]
