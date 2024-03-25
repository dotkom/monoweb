import { z } from "zod"

const EventExtraSchema = z.object({
  id: z.string(),
  name: z.string(),
  choices: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
})

export type EventExtra = z.infer<typeof EventExtraSchema>

export const EventSchema = z.object({
  id: z.string().ulid(),
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
  waitlist: z.string().ulid().nullable(),
  extras: z.array(EventExtraSchema).nullable(),
})

export type EventId = Event["id"]
export type Event = z.infer<typeof EventSchema>

export const EventWriteSchema = EventSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type EventWrite = z.infer<typeof EventWriteSchema>

export const AttendeeextrasSchema = z.object({
  id: z.string(),
  choice: z.string(),
})

export const AttendeeSchema = z.object({
  id: z.string(),
  attendanceId: z.string().ulid(),
  userId: z.string().ulid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  attended: z.boolean(),
  extras: z
    .array(
      z.object({
        id: z.string(),
        choice: z.string(),
      })
    )
    .nullable()
    .optional(),
})

export const AttendanceExtrasSchema = z.object({
  id: z.string(),
  name: z.string(),
  choices: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
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
  extras: z.array(AttendanceExtrasSchema).nullable().optional(),
})

export type AttendanceId = Attendance["id"]
export type Attendance = z.infer<typeof AttendanceSchema>

export type AttendeeId = Attendee["id"]
export type Attendee = z.infer<typeof AttendeeSchema>

export const AttendanceWriteSchema = AttendanceSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
  attendees: true,
  extras: true,
})

export const AttendeeWriteSchema = AttendeeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  extras: true,
})

export type AttendanceWrite = z.infer<typeof AttendanceWriteSchema>
export type AttendeeWrite = z.infer<typeof AttendeeWriteSchema>

const EventFeedbackSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  eventId: z.string(),
  deadline: z.date(),
})

export type EventFeedbackId = EventFeedback["id"]
export type EventFeedback = z.infer<typeof EventFeedbackSchema>

export const EventFeedbackWriteSchema = EventFeedbackSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type EventFeedbackWrite = z.infer<typeof EventFeedbackWriteSchema>

const EventFeedbackQuestionTypeSchema = z.enum(["text", "multiple_choice"])

export type EventFeedbackQuestionType = z.infer<typeof EventFeedbackQuestionTypeSchema>

const EventFeedbackQuestionSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  questionText: z.string(),
  questionType: EventFeedbackQuestionTypeSchema,
  feedbackId: z.string(),
})

export type EventFeedbackQuestionId = EventFeedbackQuestion["id"]
export type EventFeedbackQuestion = z.infer<typeof EventFeedbackQuestionSchema>

export const EventFeedbackQuestionWriteSchema = EventFeedbackQuestionSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type EventFeedbackQuestionWrite = z.infer<typeof EventFeedbackQuestionWriteSchema>

const EventFeedbackAnswerSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  feedbackQuestionId: z.string(),
  userId: z.string(),
  answer: z.any(),
})

export type EventFeedbackAnswerId = EventFeedbackAnswer["id"]
export type EventFeedbackAnswer = z.infer<typeof EventFeedbackAnswerSchema>

export const EventFeedbackAnswerWriteSchema = EventFeedbackAnswerSchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type EventFeedbackAnswerWrite = z.infer<typeof EventFeedbackAnswerWriteSchema>

const EventFeedbackQuestionCompanySchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  questionId: z.string(),
  companyId: z.string(),
})

export type EventFeedbackQuestionCompanyId = EventFeedbackQuestionCompany["id"]
export type EventFeedbackQuestionCompany = z.infer<typeof EventFeedbackQuestionCompanySchema>

export const EventFeedbackQuestionCompanyWriteSchema = EventFeedbackQuestionCompanySchema.partial({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export type EventFeedbackQuestionCompanyWrite = z.infer<typeof EventFeedbackQuestionCompanyWriteSchema>
