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

// The other fields are not stored in app_metadata in auth0. Updating them will needs to be investigated further.
export const UserUpdateSchema = UserSchema.omit({
  auth0Id: true,
  createdAt: true,
  updatedAt: true,
  email: true,
  emailVerified: true,
}).strict()
export type UserUpdate = z.infer<typeof UserUpdateSchema>

// Users cannot be created from monoweb, only synced from auth0. We sync all fields down.
export const UserCreateSchema = UserSchema
export type UserCreate = z.infer<typeof UserCreateSchema>

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
