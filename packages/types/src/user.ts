import { z } from "zod"

export const UserSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  cognitoSub: z.string().uuid(),
  studyYear: z.number().int().min(-1).max(6),
})

export type UserId = User["id"]
export type User = z.infer<typeof UserSchema>

export const UserWriteSchema = UserSchema.omit({
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
