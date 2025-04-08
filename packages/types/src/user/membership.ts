import { z } from "zod"
import { getAcademicYear } from "@dotkomonline/utils"

export const MembershipTypeSchema = z.enum(["BACHELOR", "MASTER", "SOCIAL", "PHD", "KNIGHT"])

export const MembershipSchema = z.object({
  type: MembershipTypeSchema,
  specialization: z.string().optional(),
  start_year: z.number(),
})

export type Membership = z.infer<typeof MembershipSchema>
export type MembershipType = Membership["type"]

export function isMembershipValid(membership: Membership) {
  return getMembershipGrade(membership) !== null || membership.type === "KNIGHT"
}

export function getMembershipGrade(membership: Membership): number | null {
  const currentAcademicYear = getAcademicYear(new Date())
  const yearsSinceMembershipStart = currentAcademicYear - membership.start_year

  switch (membership.type) {
    case "BACHELOR":
      if (yearsSinceMembershipStart > 4)
        return null

      return Math.min(1 + yearsSinceMembershipStart, 3)

    case "MASTER":
      if (yearsSinceMembershipStart > 3)
        return null

      return Math.min(4 + yearsSinceMembershipStart, 5)
    case "SOCIAL":
      if (yearsSinceMembershipStart > 5)
        return null
      return Math.min(1 + yearsSinceMembershipStart, 5)
    case "PHD":
      return 6
    case "KNIGHT":
      return null
  }
}
