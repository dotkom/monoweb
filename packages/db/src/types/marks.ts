import { Generated } from "kysely"

export interface MarkTable {
  id: Generated<string>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  title: string
  category: string
  details: string
  duration: number
}

export interface PersonalMarkTable {
  markId: string
  userId: string
}
