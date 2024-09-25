import { z } from "zod"

export const GenderSchema = z.enum(["male", "female", "other"])

export const UserProfileSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  gender: GenderSchema,
  allergies: z.array(z.string()),
  rfid: z.string().nullable(),
  compiled: z.boolean(),
  address: z.string().nullable(),
})

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
  emailVerified: z.boolean(),
  profile: UserProfileSchema.optional(),
})

export const UserWriteSchema = UserSchema.omit({
  id: true,
  emailVerified: true,
})

export type User = z.infer<typeof UserSchema>

export type UserProfile = z.infer<typeof UserProfileSchema>

export type UserWrite = z.infer<typeof UserWriteSchema>

export type UserId = User["id"]
