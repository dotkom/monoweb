import type { Attendance, Attendee } from "@dotkomonline/types"
import { Text, cn } from "@dotkomonline/ui"
import { formatDate, isEqual, isPast, isThisYear, min } from "date-fns"
import { nb } from "date-fns/locale"
import React from "react"

const dateComponent = (label: string, dateStr: string, time: string, showNotice?: boolean) => (
  <div className="flex flex-col gap-0">
    <Text className={cn(showNotice && "px-0.5 bg-yellow-100 rounded-sm")}>{label}</Text>
    <div className="flex flex-row gap-2 dark:text-stone-300 text-base sm:flex-col sm:gap-0 sm:text-sm">
      <Text>{dateStr}</Text>
      <Text>kl. {time}</Text>
    </div>
  </div>
)

interface AttendanceDateInfoProps {
  attendance: Attendance
  attendee: Attendee | null
  chargeScheduleDate?: Date | null
}

export const AttendanceDateInfo = ({ attendance, attendee, chargeScheduleDate }: AttendanceDateInfoProps) => {
  const { registerStart, registerEnd, deregisterDeadline } = attendance

  const actualDeregisterDeadline = chargeScheduleDate
    ? min([deregisterDeadline, chargeScheduleDate])
    : deregisterDeadline

  const hasPaid = Boolean(
    attendance.attendancePrice &&
      attendee &&
      (attendee.paymentChargedAt ||
        attendee.paymentReservedAt ||
        (attendee.paymentRefundedAt && !attendee.paymentDeadline))
  )

  const showDeregisterDeadlineNotice = hasPaid && !isEqual(actualDeregisterDeadline, deregisterDeadline)

  const dateBlocks = [
    {
      key: "registerStart",
      date: registerStart,
      element: dateComponent(
        isPast(registerStart) ? "Åpnet" : "Åpner",
        formatDate(registerStart, isThisYear(registerStart) ? "dd. MMMM" : "dd.MM.yyyy", { locale: nb }),
        formatDate(registerStart, "HH:mm", { locale: nb })
      ),
    },
    {
      key: "registerEnd",
      date: registerEnd,
      element: dateComponent(
        isPast(registerEnd) ? "Lukket" : "Lukker",
        formatDate(registerEnd, isThisYear(registerEnd) ? "dd. MMMM" : "dd.MM.yyyy", { locale: nb }),
        formatDate(registerEnd, "HH:mm", { locale: nb })
      ),
    },
    {
      key: "deregisterDeadline",
      date: actualDeregisterDeadline,
      element: dateComponent(
        "Avmeldingsfrist",
        formatDate(actualDeregisterDeadline, isThisYear(actualDeregisterDeadline) ? "dd. MMMM" : "dd.MM.yyyy", {
          locale: nb,
        }),
        formatDate(actualDeregisterDeadline, "HH:mm", { locale: nb }),
        showDeregisterDeadlineNotice
      ),
    },
  ]

  const sortedElements = dateBlocks.toSorted((a, b) => a.date.getTime() - b.date.getTime())

  const element = (
    <div className="flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-x-4">
      {sortedElements.map(({ element, key }, index) => (
        <React.Fragment key={key}>
          {element}
          {index < sortedElements.length - 1 && (
            <span className="grow h-0.5 rounded-full bg-gray-600 dark:bg-stone-600 invisible sm:visible" />
          )}
        </React.Fragment>
      ))}
    </div>
  )

  if (!showDeregisterDeadlineNotice) {
    return element
  }

  return (
    <div className="flex flex-col">
      {element}
      <Text className="text-xs text-gray-500 dark:text-stone-500">Avmeldingsfrist er endret grunnet betaling.</Text>
    </div>
  )
}
