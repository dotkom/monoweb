import type { Prisma } from "@prisma/client";

export const getEventCompany: (
  event_ids: string[],
  company_ids: string[],
) => Prisma.EventCompanyCreateManyInput[] = (event_ids, company_ids) => [
  {
    eventId: event_ids[0],
    companyId: company_ids[0]
  },
  {
    eventId: event_ids[0],
    companyId: company_ids[1]
  },
  {
    eventId: event_ids[1],
    companyId: company_ids[1]
  },
]
