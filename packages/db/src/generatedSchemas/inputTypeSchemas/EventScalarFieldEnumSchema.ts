import { z } from 'zod';

export const EventScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','title','start','end','status','public','description','subtitle','imageUrl','locationTitle','locationAddress','locationLink','attendanceId','type']);

export default EventScalarFieldEnumSchema;
