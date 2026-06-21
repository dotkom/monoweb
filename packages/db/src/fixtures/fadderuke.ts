import type { Prisma } from "../"
import { FADDERUKE_EVENT_ID, getFadderukeInterval } from "./event"

export const getFadderukeFixture = (): Prisma.FadderukeCreateInput => ({
  year: getFadderukeInterval().start.getFullYear(),
  event: {
    connect: { id: FADDERUKE_EVENT_ID },
  },
})
