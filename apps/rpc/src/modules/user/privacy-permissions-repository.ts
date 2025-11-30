import type { DBHandle } from "@dotkomonline/db"
import {
  type PrivacyPermissions,
  PrivacyPermissionsSchema,
  type PrivacyPermissionsWrite,
  type UserId,
} from "@dotkomonline/types"
import { parseOrReport } from "../../invariant"

export interface PrivacyPermissionsRepository {
  create(handle: DBHandle, userId: UserId, data: Partial<PrivacyPermissionsWrite>): Promise<PrivacyPermissions>
  update(handle: DBHandle, userId: UserId, data: Partial<PrivacyPermissionsWrite>): Promise<PrivacyPermissions | null>
  findByUserId(handle: DBHandle, userId: UserId): Promise<PrivacyPermissions | null>
}

export function getPrivacyPermissionsRepository(): PrivacyPermissionsRepository {
  return {
    async create(handle, userId, data) {
      const permissions = await handle.privacyPermissions.create({
        data: {
          ...data,
          userId,
        },
      })

      return parseOrReport(PrivacyPermissionsSchema, permissions)
    },

    async update(handle, userId, data) {
      const permissions = await handle.privacyPermissions.update({
        where: {
          userId,
        },
        data,
      })

      return parseOrReport(PrivacyPermissionsSchema, permissions)
    },

    async findByUserId(handle, userId) {
      const permissions = await handle.privacyPermissions.findUnique({
        where: {
          userId,
        },
      })

      return parseOrReport(PrivacyPermissionsSchema, permissions)
    },
  }
}
