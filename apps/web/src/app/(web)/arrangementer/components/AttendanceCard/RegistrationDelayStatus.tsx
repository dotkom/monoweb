"use client"

import { formatCompactTimeUntil } from "@/utils/countdown/formatCompactTimeUntil"
import { useCompactCountdown } from "@/utils/countdown/use-compact-countdown"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import { Text, cn } from "@dotkomonline/ui"
import { IconHourglassEmpty } from "@tabler/icons-react"
import styles from "./RegistrationDelayStatus.module.css"

export const RegistrationDelayStatus = ({ attendee }: { attendee: Attendee }) => {
  const countdownDisplay = useCompactCountdown(attendee.earliestReservationAt)
  const countdownDescription = countdownDisplay === "Nå" ? "nå" : `om ${countdownDisplay}`
  const originalDelayDisplay = formatCompactTimeUntil(attendee.earliestReservationAt, attendee.createdAt)

  return (
    <div className="rounded-t-md rounded-b-xl w-full overflow-hidden bg-gray-200/40 dark:bg-stone-700/40">
      <div className="flex flex-col grow items-center p-3">
        <div className="max-w-xs grid grid-cols-[auto_1fr] gap-2 items-start text-left">
          <IconHourglassEmpty aria-hidden className={cn("size-5 shrink-0", styles.hourglass)} />

          <Text className="text-sm font-medium" suppressHydrationWarning>
            Påmeldingen din behandles {countdownDescription}
          </Text>

          <Text className="text-sm col-start-2 text-gray-600 dark:text-stone-300">
            Du får plass dersom det er ledig.
            <br />
            Ellers blir du satt bakerst i køen.
          </Text>

          <Text className="text-xs col-start-2 text-gray-600 dark:text-stone-300">
            Du hadde {originalDelayDisplay} utsettelse.
          </Text>
        </div>
      </div>
    </div>
  )
}
