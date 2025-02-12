import { z } from 'zod';

export const CompanyTypeSchema = z.enum(['Consulting','Research','Development','Other']);

export type CompanyTypeType = `${z.infer<typeof CompanyTypeSchema>}`

export default CompanyTypeSchema;
