import { z } from "zod";

export const PrivacyPermissionsSchema = z.object({
  addressVisible: z.boolean(),
  attendanceVisible: z.boolean(),
  createdAt: z.date(),
  emailVisible: z.boolean(),
  phoneVisible: z.boolean(),
  profileVisible: z.boolean(),
  updatedAt: z.date(),
  userId: z.string(),
  usernameVisible: z.boolean(),
});

export type PrivacyPermissions = z.infer<typeof PrivacyPermissionsSchema>;

export const PrivacyPermissionsWriteSchema = PrivacyPermissionsSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type PrivacyPermissionsWrite = z.infer<typeof PrivacyPermissionsWriteSchema>;
