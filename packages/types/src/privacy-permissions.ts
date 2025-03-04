import { schemas } from "@dotkomonline/db"
import type { z } from "zod"

export const PrivacyPermissionsSchema = schemas.PrivacyPermissionsSchema.extend({})

export type PrivacyPermissions = z.infer<typeof PrivacyPermissionsSchema>

export const PrivacyPermissionsWriteSchema = PrivacyPermissionsSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type PrivacyPermissionsWrite = z.infer<typeof PrivacyPermissionsWriteSchema>
