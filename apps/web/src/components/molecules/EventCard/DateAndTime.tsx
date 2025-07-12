import { Icon, Text } from "@dotkomonline/ui"
import { differenceInDays, formatDate, isPast, isSameDay, isSameYear, isThisYear } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"

const useDateFormats = (
  start: Date,
  end: Date
): {
  singleDay: boolean
  showTime: boolean
  startDate: string
  endDate: string
  startTime: string
  endTime: string
} => {
  const now = new Date()
  const singleDay = isSameDay(start, end)
  const withinAWeek = Math.abs(differenceInDays(start, now)) < 7
  const excludeYear = isSameYear(start, end) && isThisYear(start)

  return {
    singleDay,
    showTime: withinAWeek && !isPast(start),
    startDate: formatDate(start, excludeYear ? "dd. MMM" : "dd.MM.yyyy", { locale: nb }),
    endDate: formatDate(end, excludeYear ? "dd. MMM" : "dd.MM.yyyy", { locale: nb }),
    startTime: formatDate(start, "HH:mm", { locale: nb }),
    endTime: formatDate(end, "HH:mm", { locale: nb }),
  }
}

interface EventListItemDateAndTimeProps {
  start: Date
  end: Date
}

export const DateAndTime: FC<EventListItemDateAndTimeProps> = ({ start, end }) => {
  const { singleDay, showTime, startDate, endDate, startTime, endTime } = useDateFormats(start, end)

  if (singleDay) {
    return (
      <div className="flex flex-row gap-2 items-center">
        <div className="flex flex-row gap-2 items-center">
          <Icon icon="tabler:calendar-event" className="text-base text-gray-800" />
          <Text className="text-sm">{startDate}</Text>
        </div>

        {showTime && (
          <div className="flex flex-row gap-2 items-center">
            <Icon icon="tabler:clock" className="text-base text-gray-800 ml-2" />
            <Text className="text-sm">
              {startTime} - {endTime}
            </Text>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-row gap-2 items-center">
      <Icon icon="tabler:calendar-event" className="text-base text-gray-800" />

      <div className="flex flex-row gap-1">
        <Text className="text-sm">{startDate}</Text>
        {showTime && <Text className="text-sm"> kl. {startTime}</Text>}
      </div>

      <Text className="text-sm text-gray-800">til</Text>

      <div className="flex flex-row gap-1">
        <Text className="text-sm">{endDate}</Text>
        {showTime && <Text className="text-sm">kl. {endTime}</Text>}
      </div>
    </div>
  )
}
