import { z } from 'zod';

export const AttendancePoolScalarFieldEnumSchema = z.enum(['id','createdAt','updatedAt','title','attendanceId','yearCriteria','capacity','isVisible','type']);

export default AttendancePoolScalarFieldEnumSchema;
