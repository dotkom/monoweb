import { z } from "zod"

export const UserSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  name: z.string().optional(),
  email: z.string(),
  emailVerified: z.date().optional(),
  password: z.string(),
  image: z.string().optional(),
})

export type User = z.infer<typeof UserSchema>

export const UserWriteSchema = UserSchema.partial({
  id: true,
  createdAt: true,
})

export type UserWrite = z.infer<typeof UserWriteSchema>
