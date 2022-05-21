import { z } from "zod"
import { User as PrismaUser } from "@dotkom/db"

export const userSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
})

export type User = z.infer<typeof userSchema>
export type InsertUser = Omit<User, "id">

export const mapToUser = (payload: PrismaUser): User => {
  const user: User = {
    ...payload,
    firstName: payload.first_name,
    lastName: payload.last_name,
  }
  return userSchema.parse(user)
}
