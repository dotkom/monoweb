import { z } from 'zod';

/////////////////////////////////////////
// OFFLINE SCHEMA
/////////////////////////////////////////

export const OfflineSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  title: z.string(),
  published: z.coerce.date(),
  fileUrl: z.string().nullable(),
  imageUrl: z.string().nullable(),
})

export type Offline = z.infer<typeof OfflineSchema>

export default OfflineSchema;
