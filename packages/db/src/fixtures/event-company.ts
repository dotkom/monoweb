import type { Prisma } from "../"
import { companyId } from "./company"
import { eventId } from "./event"

export const getEventCompanyFixtures = (): Prisma.EventCompanyCreateManyInput[] => [
  {
    eventId: eventId("itex"),
    companyId: companyId("bekk"),
  },
  {
    eventId: eventId("itex"),
    companyId: companyId("juniorConsulting"),
  },
  {
    eventId: eventId("vinkurs"),
    companyId: companyId("juniorConsulting"),
  },
]
