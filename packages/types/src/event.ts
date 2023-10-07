import { z } from "zod";

export const EventSchema = z.object({
  committeeId: z.string().nullable(),
  createdAt: z.date(),
  description: z.string().nullable(),
  end: z.date(),
  id: z.string().uuid(),
  imageUrl: z.string().nullable(),
  location: z.string().nullable(),
  public: z.boolean(),
  start: z.date(),
  status: z.enum(["TBA", "PUBLIC", "NO_LIMIT", "ATTENDANCE"]),
  subtitle: z.string().nullable(),
  title: z.string().min(1),
  type: z.enum(["SOCIAL", "COMPANY", "BEDPRES", "ACADEMIC"]),
  updatedAt: z.date(),
  waitlist: z.string().uuid().nullable(),
});

export type Event = z.infer<typeof EventSchema>;
export type EventId = Event["id"];

export const EventWriteSchema = EventSchema.partial({
  createdAt: true,
  id: true,
  updatedAt: true,
});

export type EventWrite = z.infer<typeof EventWriteSchema>;

export const AttendeeSchema = z.object({
  attendanceId: z.string().uuid(),
  createdAt: z.coerce.date(),
  id: z.string(),
  updatedAt: z.coerce.date(),
  userId: z.string().uuid(),
});

export const AttendanceSchema = z.object({
  attendees: z.array(AttendeeSchema),
  createdAt: z.date(),
  deregisterDeadline: z.date(),
  end: z.date(),
  eventId: z.string(),
  id: z.string(),
  limit: z.number(),
  max: z.number().min(0).max(5),
  min: z.number().min(0).max(5),
  start: z.date(),
  updatedAt: z.date(),
});

export type Attendance = z.infer<typeof AttendanceSchema>;
export type Attendee = z.infer<typeof AttendeeSchema>;

export const AttendanceWriteSchema = AttendanceSchema.partial({
  attendees: true,
  createdAt: true,
  id: true,
  updatedAt: true,
});

export const AttendeeWriteSchema = AttendeeSchema.omit({
  createdAt: true,
  id: true,
  updatedAt: true,
});

export type AttendanceWrite = z.infer<typeof AttendanceWriteSchema>;
export type AttendeeWrite = z.infer<typeof AttendeeWriteSchema>;
