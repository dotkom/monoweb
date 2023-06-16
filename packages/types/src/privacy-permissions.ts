import { z } from "zod"

export const PrivacyPermissionsSchema = z.object({
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  profileVisible: z.boolean(),
  usernameVisible: z.boolean(),
  emailVisible: z.boolean(),
  phoneVisible: z.boolean(),
  addressVisible: z.boolean(),
  attendanceVisible: z.boolean(),
})

export type PrivacyPermissions = z.infer<typeof PrivacyPermissionsSchema>

export const PrivacyPermissionsWriteSchema = PrivacyPermissionsSchema.omit({
  createdAt: true,
  updatedAt: true,
})

export type PrivacyPermissionsWrite = z.infer<typeof PrivacyPermissionsWriteSchema>
