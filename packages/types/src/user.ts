import { z } from "zod"

export const UserSchema = z.object({
  id: z.string().ulid(),
  auth0Id: z.string(),
  email: z.string().email(),
  givenName: z.string(),
  familyName: z.string(),
  middleName: z.string(),
  gender: z.enum(["male", "female", "other"]),
  name: z.string(),
  phone: z.string().nullable(),
  studyYear: z.number().int().min(-1).max(6),
  allergies: z.array(z.string()),
  picture: z.string().nullable(),
  lastSyncedAt: z.date().nullable(),
})

export type UserId = User["id"]
export type User = z.infer<typeof UserSchema>

export const UserWriteSchema = UserSchema.partial({
  id: true,
})
export type UserWrite = z.infer<typeof UserWriteSchema>

export const DBUserWriteSchema = UserSchema.omit({ auth0Id: true })
export const Auth0UserWriteSchema = UserSchema.omit({ id: true })

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
