import { z } from "zod"
import { MembershipSchema } from "./membership"

export const GenderSchema = z.enum(["male", "female", "other"])

const UserFlagEnum = z.enum([
  // Add flags here
  "VANITY_VERIFIED",
])

export const UserFlagSchema = z
  .array(UserFlagEnum)
  .refine((flags) => new Set(flags).size === flags.length, { message: "Flags must be unique" })

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
  flags: UserFlagSchema.default([]),

  membership: MembershipSchema.nullable().default(null),
  displayName: z.string().nullable().default(null),
})

export const UserWriteSchema = UserSchema.omit({
  id: true,
})

export type User = z.infer<typeof UserSchema>

export type UserWrite = z.infer<typeof UserWriteSchema>

export type UserId = User["id"]

export type UserFlag = z.infer<typeof UserFlagSchema>[number]

type UserNameResolvable = { name: string | null; firstName: string | null; lastName: string | null }
export function getDisplayName<T extends UserNameResolvable>({ name, firstName, lastName }: T): string {
  if (name) {
    return name
  }

  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }

  return lastName || firstName || "Ukjent bruker"
}
