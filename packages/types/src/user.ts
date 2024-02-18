import { z } from "zod"
import { UserIDPSchema } from "./user-idp"

export const UserDBSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  auth0Sub: z.string(),
  studyYear: z.number().int().min(-1).max(6),
})

export const UserSchema = UserDBSchema.merge(UserIDPSchema)

export type UserId = User["id"]
export type User = z.infer<typeof UserSchema>
export type UserDB = z.infer<typeof UserDBSchema>

export const UserWriteSchema = UserDBSchema.omit({
  id: true,
  createdAt: true,
})

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
  value: parseInt(value),
  label,
}))
