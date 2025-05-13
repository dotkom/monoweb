import type { Attendance } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import React from "react"

const getFormatString = (isInSameYear: boolean) => (isInSameYear ? "dd. MMMM" : "dd.MM.yyyy")

const formatTime = (date: Date) => formatDate(date, "HH:mm", { locale: nb })

const dateComponent = (label: string, dateStr: string, time: string) => (
  <div>
    <Text className="text-base">{label}</Text>
    <div className="flex flex-row gap-2 text-slate-12 text-base sm:flex-col sm:gap-0 sm:text-sm">
      <Text>{dateStr}</Text>
      <Text>kl. {time}</Text>
    </div>
  </div>
)

interface AttendanceDateInfoProps {
  attendance: Attendance
}

export const AttendanceDateInfo = ({ attendance }: AttendanceDateInfoProps) => {
  const now = new Date()

  const isAttendanceStartInPast = attendance.registerStart < now
  const isAttendanceStartInSameYear = attendance.registerStart.getFullYear() === now.getFullYear()
  const isAttendanceClosedInPast = attendance.registerEnd < now
  const isAttendanceClosedInSameYear = attendance.registerEnd.getFullYear() === now.getFullYear()
  const isDeregisterDeadlineInSameYear = attendance.deregisterDeadline.getFullYear() === now.getFullYear()

  const registerStartDate = formatDate(attendance.registerStart, getFormatString(isAttendanceStartInSameYear), {
    locale: nb,
  })
  const registerEndDate = formatDate(attendance.registerEnd, getFormatString(isAttendanceClosedInSameYear), {
    locale: nb,
  })
  const deregisterDeadlineDate = formatDate(
    attendance.deregisterDeadline,
    getFormatString(isDeregisterDeadlineInSameYear),
    { locale: nb }
  )

  const dateBlocks = [
    {
      key: "registerStart",
      date: attendance.registerStart,
      element: dateComponent(
        isAttendanceStartInPast ? "Åpnet" : "Åpner",
        registerStartDate,
        formatTime(attendance.registerStart)
      ),
    },
    {
      key: "registerEnd",
      date: attendance.registerEnd,
      element: dateComponent(
        isAttendanceClosedInPast ? "Lukket" : "Lukker",
        registerEndDate,
        formatTime(attendance.registerEnd)
      ),
    },
    {
      key: "deregisterDeadline",
      date: attendance.deregisterDeadline,
      element: dateComponent("Avmeldingsfrist", deregisterDeadlineDate, formatTime(attendance.deregisterDeadline)),
    },
  ]

  const sortedElements = dateBlocks.sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <div className="flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-x-4">
      {sortedElements.map(({ element, key }, index) => (
        <React.Fragment key={key}>
          {element}
          {index < sortedElements.length - 1 && (
            <span className="flex-grow h-0.5 rounded-full bg-slate-7 invisible sm:visible" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
