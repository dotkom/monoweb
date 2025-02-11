import { z } from 'zod';

/////////////////////////////////////////
// MARK SCHEMA
/////////////////////////////////////////

export const MarkSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  updatedAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  category: z.string(),
  details: z.string().nullable(),
  duration: z.number().int(),
})

export type Mark = z.infer<typeof MarkSchema>

export default MarkSchema;
