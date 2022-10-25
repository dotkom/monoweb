import { z } from "zod"
import { User as PrismaUser } from "@dotkomonline/db"

const userSchema = z.object({
  id: z.string().cuid(),
  name: z.string().optional(),
  email: z.string().email().optional(),
})

export type User = z.infer<typeof userSchema>
export type InsertUser = Omit<User, "id">

export const mapToUser = (payload: PrismaUser): User => {
  const user: User = {
    id: payload.id,
  }
  return userSchema.parse(user)
}
