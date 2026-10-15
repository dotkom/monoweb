"use client"

import { formatCompactTimeUntil } from "@/utils/countdown/formatCompactTimeUntil"
import { useCompactCountdown } from "@/utils/countdown/use-compact-countdown"
import type { Attendee } from "@dotkomonline/rpc/attendance"
import { Text } from "@dotkomonline/ui"
import { IconHourglassEmpty } from "@tabler/icons-react"
import { AttendanceStatusGroup } from "./AttendanceStatusGroup"
import { AttendanceStatusRow } from "./AttendanceStatusRow"
import styles from "./RegistrationDelayStatus.module.css"

export const RegistrationDelayStatus = ({ attendee }: { attendee: Attendee }) => {
  const countdownDisplay = useCompactCountdown(attendee.registrationEligibleAt)
  const countdownDescription = countdownDisplay === "Nå" ? "nå" : `om ${countdownDisplay}`
  const originalDelayDisplay = formatCompactTimeUntil(attendee.registrationEligibleAt, attendee.createdAt)

  return (
    <div className="rounded-t-md rounded-b-xl w-full overflow-hidden bg-gray-200/40 dark:bg-stone-700/40">
      <div className="flex flex-col grow items-center p-3">
        <AttendanceStatusGroup className="max-w-xs">
          <AttendanceStatusRow
            icon={<IconHourglassEmpty className={styles.hourglass} />}
            className="text-sm"
            contentClassName="gap-2"
          >
            <Text className="text-sm font-medium" suppressHydrationWarning>
              Påmeldingen din behandles {countdownDescription}
            </Text>

            <Text className="text-sm text-gray-600 dark:text-stone-300">
              Du får plass dersom det er ledig.
              <br />
              Ellers blir du satt bakerst i køen.
            </Text>

            <Text className="text-xs text-gray-600 dark:text-stone-300">
              Du hadde {originalDelayDisplay} utsettelse.
            </Text>
          </AttendanceStatusRow>
        </AttendanceStatusGroup>
      </div>
    </div>
  )
}
