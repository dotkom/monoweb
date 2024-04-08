import type { Database } from "@dotkomonline/db"
import type { Insertable } from "kysely"
import type { InsertedIds } from "../fixture"

export const getEventCompany: (
  event_ids: InsertedIds["event"],
  company_ids: InsertedIds["company"]
) => Insertable<Database["eventCompany"]>[] = (event_ids, company_ids) => [
  {
    eventId: event_ids[0],
    companyId: company_ids[0],
  },
  {
    eventId: event_ids[0],
    companyId: company_ids[1],
  },
  {
    eventId: event_ids[1],
    companyId: company_ids[1],
  },
]
