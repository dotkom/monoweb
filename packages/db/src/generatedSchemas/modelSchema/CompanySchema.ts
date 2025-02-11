import { z } from 'zod';
import { CompanyTypeSchema } from '../inputTypeSchemas/CompanyTypeSchema'

/////////////////////////////////////////
// COMPANY SCHEMA
/////////////////////////////////////////

export const CompanySchema = z.object({
  type: CompanyTypeSchema,
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  name: z.string(),
  description: z.string(),
  phone: z.string().nullable(),
  email: z.string(),
  website: z.string(),
  location: z.string().nullable(),
  image: z.string().nullable(),
})

export type Company = z.infer<typeof CompanySchema>

export default CompanySchema;
