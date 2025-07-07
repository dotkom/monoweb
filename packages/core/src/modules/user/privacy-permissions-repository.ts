import type { DBHandle } from "@dotkomonline/db"
import type { PrivacyPermissions, PrivacyPermissionsWrite, UserId } from "@dotkomonline/types"

export interface PrivacyPermissionsRepository {
  getByUserId(handle: DBHandle, userId: UserId): Promise<PrivacyPermissions | null>
  create(handle: DBHandle, userId: UserId, data: Partial<PrivacyPermissionsWrite>): Promise<PrivacyPermissions>
  update(handle: DBHandle, userId: UserId, data: Partial<PrivacyPermissionsWrite>): Promise<PrivacyPermissions | null>
}

export function getPrivacyPermissionsRepository(): PrivacyPermissionsRepository {
  return {
    async getByUserId(handle, userId) {
      return await handle.privacyPermissions.findUnique({ where: { userId } })
    },
    async create(handle, userId, data) {
      return await handle.privacyPermissions.create({ data: { ...data, userId } })
    },
    async update(handle, userId, data) {
      return await handle.privacyPermissions.update({ where: { userId }, data })
    },
  }
}
