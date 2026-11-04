import type { Prisma } from "../"
import { fixtureUserId, fixtureUserKeys } from "./user"

export const getNotificationPermissionsFixtures = (): Prisma.NotificationPermissionsCreateManyInput[] =>
  fixtureUserKeys().map((userKey, index) => ({
    userId: fixtureUserId[userKey],
    applications: true,
    newArticles: index % 2 === 0,
    standardNotifications: true,
    groupMessages: true,
    markRulesUpdates: index !== 1,
    receipts: true,
    registrationByAdministrator: true,
    registrationStart: index !== 2,
  }))
