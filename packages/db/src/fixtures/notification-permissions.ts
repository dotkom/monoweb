import type { Prisma } from "../"

export const getNotificationPermissionsFixtures = (
  userIds: string[]
): Prisma.NotificationPermissionsCreateManyInput[] =>
  userIds.map((userId, index) => ({
    userId,
    applications: true,
    newArticles: index % 2 === 0,
    standardNotifications: true,
    groupMessages: true,
    markRulesUpdates: index !== 1,
    receipts: true,
    registrationByAdministrator: true,
    registrationStart: index !== 2,
  }))
