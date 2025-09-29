import { z } from "zod"

const isoDateTime = z.string().datetime({ offset: true })

export const EventAttendeeSchema = z.object({
  id: z.number(),
  event_id: z.number(),
  timestamp: z.coerce.date(),
  attended: z.boolean(),
  paid: z.boolean(),
  note: z.string(),
  show_as_attending_event: z.boolean(),
  auth0_subject: z.string().nullable(),
})

export type EventAttendee = z.infer<typeof EventAttendeeSchema>

export const EventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  event_start: isoDateTime,
  event_end: isoDateTime,
  location: z.string(),
  event_type: z.number(),
  organizer_id: z.number().nullable(),
  image_original: z.string().nullable(),
  is_attendance_event: z.boolean(),
})

export const EventListSchema = z.object({
  count: z.number(),
  next: z.string().url().nullable(),
  previous: z.string().url().nullable(),
  results: z.array(EventSchema),
})

export const AttendanceEventSchema = z.object({
  id: z.number(),
  max_capacity: z.number(),
  waitlist: z.boolean(),
  guest_attendance: z.boolean(),
  registration_start: z.coerce.date(),
  registration_end: z.coerce.date(),
  unattend_deadline: z.coerce.date(),
  automatically_set_marks: z.boolean(),
  rule_bundles: z.array(z.number()),
  number_on_waitlist: z.number(),
  number_of_seats_taken: z.number(),
  has_feedback: z.boolean(),
  has_extras: z.boolean(),
  has_reservation: z.boolean(),
  extras: z.array(z.unknown()),
  payment: z.nullable(z.unknown()),
  feedback: z.nullable(z.unknown()),
  is_eligible_for_signup: z.nullable(z.boolean()),
  is_attendee: z.nullable(z.boolean()),
  is_on_waitlist: z.nullable(z.boolean()),
  what_place_is_user_on_wait_list: z.nullable(z.number()),
})

export const RuleBundleSchema = z.object({
  id: z.number(),
  description: z.string().nullable(),
  field_of_study_rules: z.array(z.number()),
  grade_rules: z.array(z.number()),
  user_group_rules: z.array(z.number()),
  rule_strings: z.array(z.string()),
})

export const GradeRuleSchema = z.object({
  id: z.number(),
  offset: z.number(),
  grade: z.number(),
})

export type GradeRule = z.infer<typeof GradeRuleSchema>

export type RuleBundle = z.infer<typeof RuleBundleSchema>

export type Event = z.infer<typeof EventSchema>
export type EventList = z.infer<typeof EventListSchema>
