import { type Attendance, type Attendee, hasAttendeePaid } from "@dotkomonline/types"
import { Text, cn } from "@dotkomonline/ui"
import { IconLock, IconLockOpen2, IconSquareX } from "@tabler/icons-react"
import { format as formatDate, isEqual, isPast, isThisYear, min } from "date-fns"
import { nb } from "date-fns/locale"
import React from "react"

const dateComponent = (label: string, date: Date, time: string, showNotice?: boolean, icon?: React.ReactNode) => {
  const shortDateStr = formatDate(date, isThisYear(date) ? "dd. MMM" : "dd.MM.yyyy", { locale: nb })
  const longDateStr = formatDate(date, isThisYear(date) ? "dd. MMMM" : "dd.MM.yyyy", { locale: nb })

  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center xs:items-start gap-4 xs:gap-0">
        <div className="xs:hidden pl-2 text-gray-600 dark:text-stone-400">{icon}</div>

        <div className="flex flex-col">
          <Text
            className={cn(
              "w-fit font-medium xs:font-thin text-sm text-gray-600 dark:text-stone-400",
              showNotice && "px-0.5 rounded-sm bg-yellow-100 dark:bg-yellow-600/25"
            )}
          >
            {label}
          </Text>

          <div className="flex flex-row gap-2 xs:flex-col xs:gap-0">
            <Text className="inline md:hidden lg:inline">{longDateStr}</Text>
            <Text className="hidden md:inline lg:hidden">{shortDateStr}</Text>
            <Text>kl. {time}</Text>
          </div>
        </div>
      </div>
    </div>
  )
}

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

  const hasPaid = hasAttendeePaid(attendance, attendee) ?? false
  const showDeregisterDeadlineNotice = hasPaid && !isEqual(actualDeregisterDeadline, deregisterDeadline)

  const dateBlocks = [
    {
      key: "registerStart",
      date: registerStart,
      element: dateComponent(
        isPast(registerStart) ? "Åpnet" : "Åpner",
        registerStart,
        formatDate(registerStart, "HH:mm", { locale: nb }),
        false,
        <IconLockOpen2 className="size-6" />
      ),
    },
    {
      key: "registerEnd",
      date: registerEnd,
      element: dateComponent(
        isPast(registerEnd) ? "Lukket" : "Lukker",
        registerEnd,
        formatDate(registerEnd, "HH:mm", { locale: nb }),
        false,
        <IconSquareX className="size-6" />
      ),
    },
    {
      key: "deregisterDeadline",
      date: actualDeregisterDeadline,
      element: dateComponent(
        "Avmeldingsfrist",
        actualDeregisterDeadline,
        formatDate(actualDeregisterDeadline, "HH:mm", { locale: nb }),
        showDeregisterDeadlineNotice,
        <IconLock className="size-6" />
      ),
    },
  ]

  const sortedElements = dateBlocks.toSorted((a, b) => a.date.getTime() - b.date.getTime())

  const element = (
    <div className="flex flex-col justify-between space-y-4 mb-4 xs:mb-2 xs:flex-row xs:space-y-0">
      {sortedElements.map(({ element, key }, index) => (
        <React.Fragment key={key}>
          {element}
          {index < sortedElements.length - 1 && (
            <>
              <span className="self-center grow h-0.5 mx-4 rounded-full bg-gray-300 dark:bg-stone-700 hidden xs:block md:hidden"/>
              <span className="self-center h-15 w-px rounded-full bg-gray-300 dark:bg-stone-700 hidden md:block"/>
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  )

  if (!showDeregisterDeadlineNotice) return element

  return (
    <div className="flex flex-col">
      {element}
      <Text className="text-xs text-gray-500 dark:text-stone-500">Avmeldingsfrist er endret grunnet betaling.</Text>
    </div>
  )
}
