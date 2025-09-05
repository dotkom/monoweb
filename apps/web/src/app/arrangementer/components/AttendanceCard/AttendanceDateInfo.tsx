import type { Attendance } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { formatDate, isPast, isThisYear } from "date-fns"
import { nb } from "date-fns/locale"
import React from "react"

const dateComponent = (label: string, dateStr: string, time: string) => (
  <div>
    <Text className="text-base">{label}</Text>
    <div className="flex flex-row gap-2 dark:text-stone-300 text-base sm:flex-col sm:gap-0 sm:text-sm">
      <Text>{dateStr}</Text>
      <Text>kl. {time}</Text>
    </div>
  </div>
)

interface AttendanceDateInfoProps {
  attendance: Attendance
}

export const AttendanceDateInfo = ({ attendance }: AttendanceDateInfoProps) => {
  const { registerStart, registerEnd, deregisterDeadline } = attendance

  const dateBlocks = [
    {
      key: "registerStart",
      date: attendance.registerStart,
      element: dateComponent(
        isPast(attendance.registerStart) ? "Åpnet" : "Åpner",
        formatDate(registerStart, isThisYear(registerStart) ? "dd. MMMM" : "dd.MM.yyyy", { locale: nb }),
        formatDate(attendance.registerStart, "HH:mm", { locale: nb })
      ),
    },
    {
      key: "registerEnd",
      date: attendance.registerEnd,
      element: dateComponent(
        isPast(attendance.registerEnd) ? "Lukket" : "Lukker",
        formatDate(registerEnd, isThisYear(registerEnd) ? "dd. MMMM" : "dd.MM.yyyy", { locale: nb }),
        formatDate(attendance.registerEnd, "HH:mm", { locale: nb })
      ),
    },
    {
      key: "deregisterDeadline",
      date: attendance.deregisterDeadline,
      element: dateComponent(
        "Avmeldingsfrist",
        formatDate(deregisterDeadline, isThisYear(deregisterDeadline) ? "dd. MMMM" : "dd.MM.yyyy", { locale: nb }),
        formatDate(attendance.deregisterDeadline, "HH:mm", { locale: nb })
      ),
    },
  ]

  const sortedElements = dateBlocks.sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
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
}
