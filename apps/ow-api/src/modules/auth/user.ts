import { Database } from "@dotkomonline/db"
import { Selectable } from "kysely"
import { z } from "zod"

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  emailVerified: z.date().optional(),
  image: z.string().optional(),
  createdAt: z.date(),
  password: z.string(),
})

export type User = z.infer<typeof userSchema>
export const mapToUser = (payload: Selectable<Database["ow_user"]>): User => {
  return userSchema.parse(payload)
}
