import { z } from 'zod';

/////////////////////////////////////////
// OW USER SCHEMA
/////////////////////////////////////////

export const OwUserSchema = z.object({
  id: z.string(),
  privacyPermissionsId: z.string().nullable(),
  notificationPermissionsId: z.string().nullable(),
})

export type OwUser = z.infer<typeof OwUserSchema>

export default OwUserSchema;
