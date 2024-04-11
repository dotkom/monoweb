import { z } from "zod"

export const UserSchema = z.object({
  auth0Id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  email: z.string().email(),
  givenName: z.string(),
  familyName: z.string(),
  emailVerified: z.boolean(),
  gender: z.enum(["male", "female", "other"]),

  name: z.string(),
  phoneNumber: z.string().nullable(),

  studyYear: z.number().int().min(-1).max(6),
  allergies: z.array(z.string()),
  profilePicture: z.string().nullable(),
  lastSyncedAt: z.date().nullable(),

  onBoarded: z.boolean(),
})

export type UserId = User["auth0Id"]
export type User = z.infer<typeof UserSchema>

//
export const UserWriteSchema = UserSchema
export type UserWrite = z.infer<typeof UserWriteSchema>

export interface StudyYears {
  [-1]: string
  0: string
  1: string
  2: string
  3: string
  4: string
  5: string
  6: string
}

export const StudyYearAliases = {
  [-1]: "Ingen medlemskap",
  [0]: "Sosialt medlem",
  [1]: "1. klasse",
  [2]: "2. klasse",
  [3]: "3. klasse",
  [4]: "4. klasse",
  [5]: "5. klasse",
  [6]: "PhD",
} as StudyYears

export const studyYearOptions = Object.entries(StudyYearAliases).map(([value, label]) => ({
  value: Number.parseInt(value),
  label,
}))
