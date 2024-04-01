import { Database } from "@dotkomonline/db"
import { EventType } from "@dotkomonline/db/src/db.generated"
import { Insertable } from "kysely"
import { z } from "zod"

const OW4APIImageSchema = z.object({
  id: z.number(),
  name: z.string(),
  timestamp: z.string(),
  description: z.string(),
  thumb: z.string(),
  original: z.string(),
  wide: z.string(),
  lg: z.string(),
  md: z.string(),
  sm: z.string(),
  xs: z.string(),
  tags: z.array(z.string()),
  photographer: z.string(),
  preset: z.string(),
  preset_display: z.string(),
})

const OW4APIAttendanceEventSchema = z.object({
  id: z.number(),
  max_capacity: z.number(),
  waitlist: z.boolean(),
  guest_attendance: z.boolean(),
  registration_start: z.string(),
  registration_end: z.string(),
  unattend_deadline: z.string(),
  automatically_set_marks: z.boolean(),
  rule_bundles: z.array(z.any()),
  number_on_waitlist: z.number(),
  number_of_seats_taken: z.number(),
  extras: z.array(z.any()),
})

const OW4APIEventSchema = z.object({
  absolute_url: z.string(),
  attendance_event: OW4APIAttendanceEventSchema.nullable(),
  company_event: z.array(z.any()), // Adjust based on the actual structure of company events
  description: z.string(),
  event_start: z.string(),
  event_end: z.string(),
  event_type: z.number(),
  id: z.number(),
  image: OW4APIImageSchema,
  ingress: z.string(),
  ingress_short: z.string(),
  location: z.string(),
  slug: z.string(),
  title: z.string(),
  organizer_name: z.string(),
  organizer: z.number(),
})

const eventTypeMapping: Map<number, EventType> = new Map()
eventTypeMapping.set(1, "SOCIAL")
eventTypeMapping.set(2, "BEDPRES")
eventTypeMapping.set(3, "ACADEMIC")
eventTypeMapping.set(4, "COMPANY")

const OW4APIEventsEndpointSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(OW4APIEventSchema),
})

async function getOW4Events(): Promise<z.infer<typeof OW4APIEventSchema>[]> {
  const url = "https://old.online.ntnu.no/api/v1/events/?format=json"

  const response = await fetch(url)
  const data = OW4APIEventsEndpointSchema.parse(await response.json())

  return data.results
}

type Attendance = Insertable<Database["attendance"]>
type Event = Insertable<Database["event"]>

export async function getEventAndAttendanceSampleData(): Promise<{
  events: Event[]
  attendances: (Attendance | null)[]
}> {
  const ow4Events = await getOW4Events()

  const events: Event[] = []
  const attendances: (Attendance | null)[] = []

  for (const ow4Event of ow4Events) {
    if (ow4Event.attendance_event) {
      attendances.push({
        deregisterDeadline: ow4Event.attendance_event.unattend_deadline,
        start: ow4Event.attendance_event.registration_start,
        end: ow4Event.attendance_event.registration_end,
        limit: ow4Event.attendance_event.max_capacity,
      })
    } else {
      attendances.push(null)
    }

    events.push({
      title: ow4Event.title,
      status: "PUBLIC",
      type: eventTypeMapping.get(ow4Event.event_type),
      public: true,
      start: ow4Event.event_start,
      end: ow4Event.event_end,
      description: ow4Event.description,
      imageUrl: ow4Event.image.lg,
      location: ow4Event.location,
    })
  }

  return {
    events,
    attendances,
  }
}
