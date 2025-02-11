import { z } from 'zod';

export const AttendanceScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','registerStart','deregisterDeadline','registerEnd','extras']);

export default AttendanceScalarFieldEnumSchema;
