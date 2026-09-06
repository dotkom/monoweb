"use client"

import { env } from "@/env"
import type { Attendance } from "@dotkomonline/rpc/attendance"
import type { Event } from "@dotkomonline/rpc/event"
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@dotkomonline/ui"
import { createAbsoluteEventPageUrl, slugify } from "@dotkomonline/utils"
import { IconChevronDown, IconDownload } from "@tabler/icons-react"
import { addMinutes, isPast } from "date-fns"
import { createGoogleCalendarLink } from "../TimeLocationBox/utils"
import { createIcsBody, downloadIcsFile, openIcsFile } from "../ics"
import Image from "next/image"

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
    <div className="inline-flex">
      <Button
        element="a"
        href={googleCalendarUrl}
        target="_blank"
        rel="noopener noreferrer"
        variant="outline"
        size="icon-lg"
        aria-label="Legg påmelding i Google Kalender"
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
