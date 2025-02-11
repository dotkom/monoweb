import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'

/////////////////////////////////////////
// ATTENDANCE SCHEMA
/////////////////////////////////////////

export const AttendanceSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  registerStart: z.coerce.date(),
  deregisterDeadline: z.coerce.date(),
  registerEnd: z.coerce.date(),
  extras: JsonValueSchema.nullable(),
})

export type Attendance = z.infer<typeof AttendanceSchema>

export default AttendanceSchema;
