import type { Prisma } from "../"
import { fixtureUserId, fixtureUserKeys } from "./user"

export const getNotificationSettingsFixtures = (): Prisma.NotificationSettingsCreateManyInput[] =>
  fixtureUserKeys().map((userKey) => ({
    userId: fixtureUserId[userKey],
  }))
