import { z } from 'zod';

export const InterestGroupScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','name','description','link','isActive','longDescription','joinInfo']);

export default InterestGroupScalarFieldEnumSchema;
