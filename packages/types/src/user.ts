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

export const UserMembershipSchema = z.object({
  startYear: z.number(),
  fieldOfStudy: z.enum([
    "SOCIAL_MEMBER",
    "OTHER_MEMBER",
    "BACHELOR",
    "MASTER_SOFTWARE_ENGINEERING",
    "MASTER_DATABASE_AND_SEARCH",
    "MASTER_ALGORITHMS",
    "MASTER_ARTIFICIAL_INTELLIGENCE",
    "PHD",
  ]),
})

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  image: z.string().nullable(),
  emailVerified: z.boolean(),
  profile: UserProfileSchema.optional(),
  membership: UserMembershipSchema.optional(),
})

export const UserWriteSchema = UserSchema.omit({
  id: true,
  emailVerified: true,
})

export type UserId = User["id"]

export type User = z.infer<typeof UserSchema>
export type UserProfile = z.infer<typeof UserProfileSchema>
export type UserMembership = z.infer<typeof UserMembershipSchema>

export type UserWrite = z.infer<typeof UserWriteSchema>
