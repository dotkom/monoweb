import { Generated, Insertable } from "kysely"

import { Timestamp } from "./common"

export interface CompanyTable {
  id: Generated<string>
  createdAt: Generated<Timestamp>
  name: string
  description: string
  email: string
  website: string
  phone: string | null
  location: string | null
  type: string | null
}
type XD = Insertable<CompanyTable>
type XD2 = XD["createdAt"]

export interface EventCompanyTable {
  eventID: string
  companyID: string
}
