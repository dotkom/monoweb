import { z } from "zod"
import { PrivacyPermissionsSchema as GeneratedPrivacyPermissionsSchema } from "@dotkomonline/db"

export const PrivacyPermissionsSchema = GeneratedPrivacyPermissionsSchema.extend({})

export type PrivacyPermissions = z.infer<typeof PrivacyPermissionsSchema>

export const PrivacyPermissionsWriteSchema = PrivacyPermissionsSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type PrivacyPermissionsWrite = z.infer<typeof PrivacyPermissionsWriteSchema>
