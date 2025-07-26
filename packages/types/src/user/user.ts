import { schemas } from "@dotkomonline/db/schemas"
import { z } from "zod"
import { MembershipSchema } from "./membership"

export const DBUserSchema = schemas.UserSchema.extend({})

export type DBUSer = z.infer<typeof DBUserSchema>

export const DBUserWriteSchema = DBUserSchema.omit({
  id: true,
})

export type DBUserWrite = z.infer<typeof DBUserWriteSchema>

export const GenderSchema = z.enum(["male", "female", "other"])

export const USER_FLAGS = [
  // Add flags here
  "VANITY_VERIFIED",
] as const

export const UserFlagSchema = z
  .enum(USER_FLAGS)
  .array()
  .refine((flags) => flags.length === new Set(flags).size, { message: "Duplicate flags are not allowed" })

export type UserFlag = (typeof USER_FLAGS)[number]

export const Auth0UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date().nullable().default(null),
  // Compilation is a ceremonial introduction for new members of Online
  compiled: z.boolean().default(false),
  email: z.string().email(),
  image: z.string().nullable().default(null),
  biography: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  gender: GenderSchema.nullable().default(null),
  allergies: z.string().nullable().default(null),
  flags: UserFlagSchema.default([]),
  ntnuUsername: z.string().nullable().default(null),
  membership: MembershipSchema.nullable().default(null),
})

export const Auth0UserWriteSchema = Auth0UserSchema.omit({
  id: true,
  createdAt: true,
})

export type Auth0User = z.infer<typeof Auth0UserSchema>
export type Auth0UserWrite = z.infer<typeof Auth0UserWriteSchema>

export const UserSchema = DBUserSchema.merge(Auth0UserSchema)
export const UserWriteSchema = DBUserWriteSchema.merge(Auth0UserWriteSchema)

export type User = z.infer<typeof UserSchema>
export type UserWrite = z.infer<typeof UserWriteSchema>

export type UserId = User["id"]
export type UserProfileSlug = User["profileSlug"]
