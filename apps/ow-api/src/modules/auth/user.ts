import type { Prisma } from "@dotkomonline/db"
import { z } from "zod"

const userSchema = z.object({
<<<<<<< HEAD
  id: z.string().uuid(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  emailVerified: z.date().optional(),
  image: z.string(),
  createdAt: z.date(),
  password: z.string(),
=======
  id: z.string().cuid(),
  name: z.string().optional(),
  email: z.string().email().optional(),
>>>>>>> 8489c56 (test out oidc login)
})

export type User = z.infer<typeof userSchema>

<<<<<<< HEAD
export const mapToUser = (payload: Prisma.UserGetPayload<null>): User => {
  return userSchema.parse(payload)
=======
export const mapToUser = (payload: PrismaUser): User => {
  const user: User = {
    id: payload.id,
  }
  return userSchema.parse(user)
>>>>>>> 8489c56 (test out oidc login)
}
