import { z } from 'zod';

export const CompanyTypeSchema = z.enum(['CONSULTING','RESEARCH','DEVELOPMENT','OTHER']);

export type CompanyTypeType = `${z.infer<typeof CompanyTypeSchema>}`

export default CompanyTypeSchema;
