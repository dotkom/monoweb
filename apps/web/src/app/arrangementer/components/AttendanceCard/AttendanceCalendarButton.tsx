"use client"

import { env } from "@/env"
import type { Attendance, Attendee } from "@dotkomonline/rpc/attendance"
import type { Event } from "@dotkomonline/rpc/event"
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@dotkomonline/ui"
import { createAbsoluteEventPageUrl, slugify } from "@dotkomonline/utils"
import { IconChevronDown, IconDownload } from "@tabler/icons-react"
import { addMinutes, isPast, min } from "date-fns"
import { createGoogleCalendarLink } from "../TimeLocationBox/utils"
import { createIcsBody, downloadIcsFile, openIcsFile } from "../ics"
import Image from "next/image"

interface AttendanceCalendarButtonProps {
  event: Event
  attendance: Attendance
  attendee: Attendee | null
  chargeScheduleDate?: Date | null
}

export function AttendanceCalendarButton({
  event,
  attendance,
  attendee,
  chargeScheduleDate,
}: AttendanceCalendarButtonProps) {
  const isAttending = attendee !== null
  const reminderDate = getAttendanceReminderDate(attendance, chargeScheduleDate, isAttending)

  if (isPast(reminderDate)) {
    return null
  }

  const eventUrl = createAbsoluteEventPageUrl(env.NEXT_PUBLIC_ORIGIN, event.id, event.title)
  const title = isAttending ? `Avmeldingsfrist: ${event.title}` : `Påmelding åpner: ${event.title}`
  const reminderEnd = addMinutes(reminderDate, 15)

  const description = isAttending
    ? `Siste frist for å melde deg av ${event.title}.\n\n${eventUrl}`
    : `Påmeldingen til ${event.title} åpner.\n\n${eventUrl}`

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

  const mainActionLabel = isAttending ? "Legg avmeldingsfrist i Google Kalender" : "Legg påmelding i Google Kalender"

  return (
    <div className="inline-flex">
      <Button
        element="a"
        href={googleCalendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        size="icon-lg"
        aria-label={mainActionLabel}
        className="rounded-r-none"
      >
        <Image src="/logo-google-calendar.svg" alt="Google Calendar" width={16} height={16} />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" aria-label="Flere kalendervalg" className="h-9 w-5 rounded-l-none border-l-0 px-0">
            <IconChevronDown className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              openIcsFile(icsBody)
            }}
          >
            <Image src="/logo-microsoft-outlook.svg" alt="Microsoft Outlook" width={16} height={16} />
            Outlook og Apple
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              downloadIcsFile(icsBody, icsFilename)
            }}
          >
            <IconDownload className="size-4" />
            Last ned .ics
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function getAttendanceReminderDate(
  attendance: Attendance,
  chargeScheduleDate: Date | null | undefined,
  isAttending: boolean
) {
  if (!isAttending) {
    return attendance.registerStart
  }

  if (chargeScheduleDate) {
    return min([attendance.deregisterDeadline, chargeScheduleDate])
  }

  return attendance.deregisterDeadline
}
