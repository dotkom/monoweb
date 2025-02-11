import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// ATTENDANCE POOL SCHEMA
/////////////////////////////////////////

export const AttendancePoolSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  title: z.string(),
  attendanceId: z.string(),
  yearCriteria: JsonValueSchema,
  capacity: z.number().int(),
  isVisible: z.boolean(),
  type: z.string(),
})

export type AttendancePool = z.infer<typeof AttendancePoolSchema>

export default AttendancePoolSchema;
