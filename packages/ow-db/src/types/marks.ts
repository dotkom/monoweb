import { Generated } from "kysely"

export interface MarkTable {
  id: Generated<string>
  title: string
  givenAt: Generated<Date>
  category: string
  details: string
  givenTo: string[]
  duration: number
}

export interface PersonalMarkTable {
  markId: string
  userId: string
}
