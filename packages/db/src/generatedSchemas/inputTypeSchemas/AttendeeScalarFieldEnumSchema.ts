import { z } from 'zod';

export const AttendeeScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','attendanceId','userId','attendancePoolId','registeredAt','extrasChoices','attended','firstName','lastName']);

export default AttendeeScalarFieldEnumSchema;
