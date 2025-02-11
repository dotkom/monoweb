import { z } from 'zod';

export const CommitteeScalarFieldEnumSchema = z.enum(['id','createdAt','name','description','email','image']);

export default CommitteeScalarFieldEnumSchema;
