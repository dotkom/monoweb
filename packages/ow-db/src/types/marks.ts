import { Generated } from "kysely"

export interface MarkTable {
  id: Generated<string>
  title: string
  givenAt: Generated<Date>
  category: string
  details: string
  duration: number
  updatedAt: Generated<Date>
}

export interface PersonalMarkTable {
  markId: string
  userId: string
}
