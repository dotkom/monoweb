import type { Prisma } from "../"
import { fixtureUserId, fixtureUserKeys } from "./user"

export const getPrivacyPermissionsFixtures = (): Prisma.PrivacyPermissionsCreateManyInput[] =>
  fixtureUserKeys().map((userKey, index) => ({
    userId: fixtureUserId[userKey],
    profileVisible: true,
    usernameVisible: index % 3 !== 0,
    emailVisible: index === 0,
    phoneVisible: false,
    addressVisible: false,
    attendanceVisible: index < 4,
  }))
