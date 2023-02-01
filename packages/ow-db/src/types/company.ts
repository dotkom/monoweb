import { Generated } from "kysely"

export interface CompanyTable {
  id: Generated<string>
  createdAt: Generated<Date>
  name: string
  description: string
  email: string
  website: string
  phone: string | null
  location: string | null
  type: string | null
}

export interface EventCompanyTable {
  eventID: string
  companyID: string
}
