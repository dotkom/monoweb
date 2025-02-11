import { z } from 'zod';

/////////////////////////////////////////
// PRIVACY PERMISSIONS SCHEMA
/////////////////////////////////////////

export const PrivacyPermissionsSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
  profileVisible: z.boolean(),
  usernameVisible: z.boolean(),
  emailVisible: z.boolean(),
  phoneVisible: z.boolean(),
  addressVisible: z.boolean(),
  attendanceVisible: z.boolean(),
})

export type PrivacyPermissions = z.infer<typeof PrivacyPermissionsSchema>

export default PrivacyPermissionsSchema;
