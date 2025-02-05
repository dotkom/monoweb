import { z } from "zod"

export const GenderSchema = z.enum(["male", "female", "other"])

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  compiled: z.boolean().default(false),
  email: z.string().email(),
  image: z.string().nullable(),

  phone: z.string().optional(),
  gender: GenderSchema.optional(),
  rfid: z.string().optional(),
  allergies: z.string().optional(),
  address: z.string().optional(),
  biography: z.string().optional(),
})

export const UserWriteSchema = UserSchema.omit({
  id: true,
})

export type User = z.infer<typeof UserSchema>

export type UserWrite = z.infer<typeof UserWriteSchema>

export type UserId = User["id"]
