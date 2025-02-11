import { z } from 'zod';

export const OfflineScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','title','published','fileUrl','imageUrl']);

export default OfflineScalarFieldEnumSchema;
