import { z } from 'zod';

/////////////////////////////////////////
// INTEREST GROUP SCHEMA
/////////////////////////////////////////

export const InterestGroupSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  name: z.string(),
  description: z.string(),
  link: z.string().nullable(),
  isActive: z.boolean(),
  longDescription: z.string(),
  joinInfo: z.string(),
})

export type InterestGroup = z.infer<typeof InterestGroupSchema>

export default InterestGroupSchema;
