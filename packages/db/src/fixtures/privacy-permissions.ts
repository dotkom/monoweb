import type { Prisma } from "../"

export const getPrivacyPermissionsFixtures = (userIds: string[]): Prisma.PrivacyPermissionsCreateManyInput[] =>
  userIds.map((userId, index) => ({
    userId,
    profileVisible: true,
    usernameVisible: index % 3 !== 0,
    emailVisible: index === 0,
    phoneVisible: false,
    addressVisible: false,
    attendanceVisible: index < 4,
  }))
