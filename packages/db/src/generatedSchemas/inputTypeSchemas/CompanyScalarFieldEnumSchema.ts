import { z } from 'zod';

export const CompanyScalarFieldEnumSchema = z.enum(['id','createdAt','name','description','phone','email','website','location','type','image']);

export default CompanyScalarFieldEnumSchema;
