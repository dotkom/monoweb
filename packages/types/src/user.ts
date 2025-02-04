import { z } from "zod"

export const GenderSchema = z.enum(["male", "female", "other"])

const MembershipTypeSchema = z.enum(["BACHELOR", "MASTER", "SOCIAL", "EXTRAORDINARY"])
type MembershipType = z.infer<typeof MembershipTypeSchema>

export const MembershipSchema = z.object({
  type: MembershipTypeSchema,
  specialization: z.string().optional(),
  start_year: z.number(),
})

export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  compiled: z.boolean().default(false),
  email: z.string().email(),
  image: z.string().nullable(),

  phone: z.string().optional(),
  gender: GenderSchema.optional(),
  rfid: z.string().optional(),
  allergies: z.string().optional(),
  address: z.string().optional(),
  biography: z.string().optional(),

  membership: MembershipSchema.optional(),
})

const gracePeriod = 1

export function membershipInformation(user: User): { year: number, isSocial: boolean } | null{
  if (!user.membership) return null

  const currentYear = new Date().getFullYear()
  const passedSummer = new Date().getMonth() > 6
  const academicYearsSinceMembershipStart = currentYear - user.membership.start_year - (passedSummer ? 0 : 1)
  const { startYear, endYear } = membershipYearRange(user.membership.type)

  if (academicYearsSinceMembershipStart + startYear > endYear + gracePeriod) {
    return null
  }

  return { year: academicYearsSinceMembershipStart + startYear, isSocial: user.membership.type === "SOCIAL" }
}

function membershipYearRange(memebershipType: MembershipType): { startYear: number, endYear: number } {
  switch (memebershipType) {
    case "SOCIAL":
    case "EXTRAORDINARY":
      return { startYear: 1, endYear: 5 }
    case "BACHELOR":
      return { startYear: 1, endYear: 3 }
    case "MASTER":
      return { startYear: 4, endYear: 5 }
  }
}

export const UserWriteSchema = UserSchema.omit({
  id: true,
})

export type User = z.infer<typeof UserSchema>

export type UserWrite = z.infer<typeof UserWriteSchema>

export type UserId = User["id"]
