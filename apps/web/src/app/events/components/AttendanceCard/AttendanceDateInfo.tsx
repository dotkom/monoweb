import type { Attendance } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import { DateFns } from "@dotkomonline/utils"
import React from "react"

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
  const { registerStart, registerEnd, deregisterDeadline } = attendance

  const allInCurrentYear =
    DateFns.isThisYear(registerStart) && DateFns.isThisYear(registerEnd) && DateFns.isThisYear(deregisterDeadline)
  const dateFormat = allInCurrentYear ? "dd. MMMM" : "dd. MMM yyyy"

  const isAttendanceStartInPast = DateFns.isPast(registerStart)
  const isAttendanceClosedInPast = DateFns.isPast(registerEnd)

  const dateBlocks = [
    {
      key: "registerStart",
      date: attendance.registerStart,
      element: dateComponent(
        isAttendanceStartInPast ? "Åpnet" : "Åpner",
        DateFns.formatDate(registerStart, dateFormat),
        DateFns.formatDate(registerStart, "HH:mm")
      ),
    },
    {
      key: "registerEnd",
      date: attendance.registerEnd,
      element: dateComponent(
        isAttendanceClosedInPast ? "Lukket" : "Lukker",
        DateFns.formatDate(registerEnd, dateFormat),
        DateFns.formatDate(registerEnd, "HH:mm")
      ),
    },
    {
      key: "deregisterDeadline",
      date: attendance.deregisterDeadline,
      element: dateComponent(
        "Avmeldingsfrist",
        DateFns.formatDate(deregisterDeadline, dateFormat),
        DateFns.formatDate(deregisterDeadline, "HH:mm")
      ),
    },
  ]

  const sortedElements = dateBlocks.toSorted((a, b) => a.date.getTime() - b.date.getTime())

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
