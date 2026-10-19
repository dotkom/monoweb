"use client"

import { useDeadlineTick } from "@/utils/use-deadline-tick"
import { cn, Text } from "@dotkomonline/ui"
import { IconHourglassEmpty } from "@tabler/icons-react"
import { isAfter } from "date-fns"
import { getUserIcons, getUserPlate } from "./UserPlate"
import type { AttendeeSummary } from "@dotkomonline/rpc/attendance"
import type { User } from "@dotkomonline/rpc/user"

interface AttendeeListProps {
  attendees: AttendeeSummary[]
  user: User
  maxNumberOfAttendees: number
}

export const AttendeeList = ({ attendees, user, maxNumberOfAttendees }: AttendeeListProps) => {
  const now = new Date()

  const delayedAttendees = attendees.filter(
    (attendee) => attendee.registered === false && isAfter(attendee.earliestReservationAt, now)
  )

  useDeadlineTick(...delayedAttendees.map((attendee) => attendee.earliestReservationAt))

  if (attendees.length === 0) {
    return <Text className="text-gray-500 dark:text-stone-500 text-sm mx-2">Ingen påmeldte</Text>
  }

  return (
    <div className="flex flex-col gap-2">
      {attendees.map((attendee, index) => {
        const Plate = getUserPlate(attendee.user)
        const minWidth = getMinWidth(maxNumberOfAttendees)
        const { smallIcons, largeIcon } = getUserIcons(attendee.user)

        const isCurrentUser = attendee.userId === user.id
        const isDelayed = attendee.registered === false && isAfter(attendee.earliestReservationAt, now)

        return (
          <div key={attendee.id} className="flex flex-row gap-1 items-center group">
            <Text
              style={{ minWidth }}
              className={cn(
                "text-gray-400 group-hover:text-black dark:text-stone-500 dark:group-hover:text-stone-300",
                "flex shrink-0 items-center justify-end text-right text-sm font-mono transition-colors"
              )}
            >
              {isDelayed ? (
                <IconHourglassEmpty className="size-4 shrink-0 mr-[0.5ch]" role="img" aria-label="Utsatt påmelding" />
              ) : (
                `${index + 1}.`
              )}
            </Text>

            <Plate
              attendee={attendee}
              user={attendee.user}
              isCurrentUser={isCurrentUser}
              smallIcons={smallIcons}
              largeIcon={largeIcon}
            />
          </div>
        )
      })}
    </div>
  )
}

function getMinWidth(maxNumberOfAttendees: number) {
  const digitCount = maxNumberOfAttendees.toString().length
  const periodCount = 1

  return `max(${digitCount + periodCount}ch, calc(1rem + ${(periodCount / 2).toFixed(2)}ch))`
}
