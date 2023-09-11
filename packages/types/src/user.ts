import { z } from "zod"

export const UserSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  cognitoSub: z.string().uuid(),
})

export type User = z.infer<typeof UserSchema>
export type UserId = User["id"]

export const UserWriteSchema = UserSchema.omit({
  id: true,
  createdAt: true,
})

export type UserWrite = z.infer<typeof UserWriteSchema>
