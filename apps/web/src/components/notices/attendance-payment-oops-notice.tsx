import type { UserId, EventWithAttendance } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { EventListItem } from "../molecules/EventListItem/EventListItem"

export const AttendancePaymentOopsNotice = ({
  userId,
  eventWithAttendance,
}: {
  userId: UserId | null
  eventWithAttendance: EventWithAttendance
}) => {
  return (
    <div className="w-full p-6 text-black bg-rose-100 dark:bg-red-900 rounded-2xl">
      <div className="flex flex-col gap-4 w-fit">
        <Text className="text-sm text-rose-800 dark:text-red-200">Oops. Dotkom har klusset med betaling igjen :(</Text>
        <Text className="text-2xl text-black dark:text-white font-bold">Du må gjennomføre en betaling på nytt!</Text>

        <div className="bg-white dark:bg-stone-950 p-2 rounded-xl text-black dark:text-white">
          <EventListItem
            userId={userId}
            event={eventWithAttendance.event}
            attendance={eventWithAttendance.attendance}
            className="-mt-2"
          />
        </div>

        <Text className="text-sm text-rose-800 dark:text-red-200">
          Du skal bare trukket <span className="underline">én</span> gang! Selv om du tidligere har betalt.
          <br />
          Dersom du allerede har blitt trukket fra kontoen eller har et beløp reservert og ser denne meldingen, ta
          kontakt.
        </Text>
        <Text className="text-sm text-rose-800 dark:text-red-200">
          Kontakt dotkom@online.ntnu.no og arrangør dersom det oppstår problemer.
        </Text>
      </div>
    </div>
  )
}
