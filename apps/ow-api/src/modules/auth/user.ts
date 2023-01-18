import type { Prisma } from "@dotkomonline/db"
import { z } from "zod"

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  emailVerified: z.date().optional(),
  image: z.string(),
  createdAt: z.date(),
  password: z.string(),
})

export type User = z.infer<typeof userSchema>

export const mapToUser = (payload: Prisma.UserGetPayload<null>): User => {
  return userSchema.parse(payload)
}
