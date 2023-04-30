import { z } from "zod"

export const UserSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
})

export type User = z.infer<typeof UserSchema>

export const UserWriteSchema = UserSchema.omit({
  createdAt: true,
})

export type UserWrite = z.infer<typeof UserWriteSchema>
