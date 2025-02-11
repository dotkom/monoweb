import { z } from 'zod';

/////////////////////////////////////////
// COMMITTEE SCHEMA
/////////////////////////////////////////

export const CommitteeSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  name: z.string(),
  description: z.string(),
  email: z.string(),
  image: z.string().nullable(),
})

export type Committee = z.infer<typeof CommitteeSchema>

export default CommitteeSchema;
