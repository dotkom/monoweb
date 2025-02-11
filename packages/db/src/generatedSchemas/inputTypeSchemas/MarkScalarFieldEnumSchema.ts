import { z } from 'zod';

export const MarkScalarFieldEnumSchema = z.enum(['id','title','updatedAt','createdAt','category','details','duration']);

export default MarkScalarFieldEnumSchema;
