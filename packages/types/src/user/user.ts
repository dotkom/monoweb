import { z } from "zod"
import { MembershipSchema } from "./membership"

export const GenderSchema = z.enum(["male", "female", "other"])

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable().default(null),
  lastName: z.string().nullable().default(null),
  compiled: z.boolean().default(false),
  email: z.string().email(),
  image: z.string().nullable().default(null),
  biography: z.string().nullable().default(null),
  phone: z.string().nullable().default(null),
  gender: GenderSchema.nullable().default(null),
  rfid: z.string().nullable().default(null),
  allergies: z.string().nullable().default(null),
  address: z.string().nullable().default(null),

  membership: MembershipSchema.nullable().default(null),
})

export const UserWriteSchema = UserSchema.omit({
  id: true,
})

export type User = z.infer<typeof UserSchema>

export type UserWrite = z.infer<typeof UserWriteSchema>

export type UserId = User["id"]

export function getDisplayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }

  if (user.lastName) {
    return user.lastName
  }

  if (user.firstName) {
    return user.firstName
  }

  return user.email
}
