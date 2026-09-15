"use client"

import { env } from "@/env"
import type { Attendance } from "@dotkomonline/rpc/attendance"
import type { Event } from "@dotkomonline/rpc/event"
import { createAbsoluteEventPageUrl, slugify } from "@dotkomonline/utils"
import { addMinutes, isPast } from "date-fns"
import { AddToCalendarButton } from "../AddToCalendarButton"
import { createGoogleCalendarLink } from "../TimeLocationBox/utils"
import { createIcsBody } from "../ics"

interface AttendanceCalendarButtonProps {
  event: Event
  attendance: Attendance
}

export function AttendanceCalendarButton({ event, attendance }: AttendanceCalendarButtonProps) {
  const reminderDate = attendance.registerStart
  const reminderEnd = addMinutes(reminderDate, 15)

  if (isPast(reminderDate)) {
    return null
  }

  const eventUrl = createAbsoluteEventPageUrl(env.NEXT_PUBLIC_ORIGIN, event.id, event.title)
  const title = `Påmelding åpner: ${event.title}`
  const description = `Påmeldingen til ${event.title} åpner.\n\n${eventUrl}`

  const googleCalendarUrl = createGoogleCalendarLink({
    title,
    description,
    start: reminderDate,
    end: reminderEnd,
  })

  const icsFilename = `${slugify(title)}.ics`
  const icsBody = createIcsBody({
    id: `${event.id}-attendance-reminder@online.ntnu.no`,
    summary: title,
    description,
    url: eventUrl,
    start: reminderDate,
    end: reminderEnd,
  })

  return (
    <AddToCalendarButton
      googleCalendarUrl={googleCalendarUrl}
      googleCalendarAriaLabel="Legg påmelding i Google Kalender"
      icsBody={icsBody}
      icsFilename={icsFilename}
    />
  )
}
