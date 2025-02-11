import { z } from 'zod';

/////////////////////////////////////////
// PERSONAL MARK SCHEMA
/////////////////////////////////////////

export const PersonalMarkSchema = z.object({
  markId: z.string(),
  userId: z.string(),
})

export type PersonalMark = z.infer<typeof PersonalMarkSchema>

export default PersonalMarkSchema;
