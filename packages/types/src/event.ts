import { z } from "zod"

export const EventSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string().min(1),
  start: z.date(),
  end: z.date(),
  status: z.enum(["TBA", "PUBLIC", "NO_LIMIT", "ATTENDANCE"]),
  type: z.enum(["SOCIAL", "COMPANY", "BEDPRES", "ACADEMIC"]),
  public: z.boolean(),
  description: z.string().nullable(),
  subtitle: z.string().nullable(),
  imageUrl: z.string().nullable(),
  location: z.string().nullable(),
  committeeId: z.string().nullable(),
  waitlist: z.string().uuid().nullable(),
})

export type Event = z.infer<typeof EventSchema>
export type EventId = Event["id"]

export const EventWriteSchema = EventSchema.extend({
  start: z.date().refine((data) => data > new Date(), { message: "Starttidspunkt må være i fremtiden" }),
  end: z.date().refine((data) => data > new Date(), { message: "Sluttidspunkt må være i fremtiden" }),
})
  .partial({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .refine(
    (data) => {
      // data.start < data.end
      return data.start < data.end
    },
    {
      message: "Starttidspunkt må være før sluttidspunkt",
      path: ["end"],
    }
  )

export const EventEditSchema = EventSchema.partial({
  createdAt: true,
  updatedAt: true,
}).refine(
  (data) => {
    // data.start < data.end
    return data.start < data.end
  },
  {
    message: "Starttidspunkt må være før sluttidspunkt",
    path: ["end"],
  }
)

// EventWriteSchema.refine((data) => data.end > data.start, {
//   message: "End date must be after the start date",
// })

export type EventWrite = z.infer<typeof EventWriteSchema>
export type EventEdit = z.infer<typeof EventEditSchema>

export const AttendeeSchema = z.object({
  id: z.string(),
  attendanceId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const AttendanceSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  start: z.date(),
  end: z.date(),
  deregisterDeadline: z.date(),
  limit: z.number(),
  eventId: z.string(),
  attendees: z.array(AttendeeSchema),
  min: z.number().min(0).max(5),
  max: z.number().min(0).max(5),
})

export type Attendance = z.infer<typeof AttendanceSchema>
export type Attendee = z.infer<typeof AttendeeSchema>

export const AttendanceWriteSchema = AttendanceSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
  attendees: true,
})

export const AttendeeWriteSchema = AttendeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type AttendanceWrite = z.infer<typeof AttendanceWriteSchema>
export type AttendeeWrite = z.infer<typeof AttendeeWriteSchema>
