import { z } from "zod"

export const UserSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  name: z.string().nullish(),
  email: z.string(),
  emailVerified: z.date().nullish(),
  image: z.string().nullish(),
})

export type User = z.infer<typeof UserSchema>

export const UserWriteSchema = UserSchema.partial({
  id: true,
  createdAt: true,
})

export type UserWrite = z.infer<typeof UserWriteSchema>
