import { z } from "zod"

export const UserIdSchema = z.string().ulid()

export const UserSchema = z.object({
  id: UserIdSchema,
  auth0Id: z.string(),
  email: z.string().email(),
  givenName: z.string(),
  familyName: z.string(),
  gender: z.enum(["male", "female", "other"]),
  name: z.string(),
  phone: z.string(),
  biography: z.string(),
  allergies: z.string(),
  picture: z.string().nullable(),
})

export type UserId = User["id"]
export type User = z.infer<typeof UserSchema>

export const UserWriteSchema = UserSchema.omit({
  id: true,
})
export type UserWrite = z.infer<typeof UserWriteSchema>

export const UserEditableFieldsSchema = UserSchema.pick({
  phone: true,
  allergies: true,
  gender: true,
  biography: true,
})

export type UserEditableFields = z.infer<typeof UserEditableFieldsSchema>
