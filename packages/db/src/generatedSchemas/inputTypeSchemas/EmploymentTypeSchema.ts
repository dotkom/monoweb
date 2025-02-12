import { z } from 'zod';

export const EmploymentTypeSchema = z.enum(['PARTTIME','FULLTIME','SUMMER_INTERNSHIP','OTHER']);

export type EmploymentTypeType = `${z.infer<typeof EmploymentTypeSchema>}`

export default EmploymentTypeSchema;
