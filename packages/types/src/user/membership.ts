import { z } from "zod"

export const MembershipTypeSchema = z.enum(["BACHELOR", "MASTER", "SOCIAL", "EXTRAORDINARY"])

export const MembershipSchema = z.object({
  type: MembershipTypeSchema,
  specialization: z.string().optional(),
  start_year: z.number(),
})

export type Membership = z.infer<typeof MembershipSchema>
export type MembershipType = Membership["type"]
