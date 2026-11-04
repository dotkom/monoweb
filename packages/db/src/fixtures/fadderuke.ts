import type { Prisma } from "../"
import { eventId } from "./event"
import { getFadderukeInterval } from "./event"

export const getFadderukeFixture = (): Prisma.FadderukeCreateInput => ({
  year: getFadderukeInterval().start.getFullYear(),
  event: {
    connect: { id: eventId("fadderuke") },
  },
})
