import type { Prisma } from "@prisma/client"
import { roundToNearestHours } from "date-fns"

const now = roundToNearestHours(new Date(), { roundingMethod: "floor" })

export const getMarkFixtures: () => Prisma.MarkCreateManyInput[] = () => [
  {
    title: "Kom for sent til Åre 2025",
    details: "Hvordan går det i det hele tatt an",
    duration: 14, // days
    weight: 3,
    type: "LATE_ATTENDANCE",
    updatedAt: now,
    createdAt: now,
  },
  {
    title: "Slå Debug-leder",
    details: "Det er ikke lov å slå andre mennesker!",
    duration: 14, // days
    weight: 3,
    type: "MANUAL",
    updatedAt: now,
    createdAt: now,
  },
]
