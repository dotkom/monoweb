import { Badge, Icon, Text, cn } from "@dotkomonline/ui"
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
  ongoing: boolean
} => {
  const withinAWeek = Math.abs(differenceInDays(start, new Date())) < 7
  const excludeYear = isSameYear(start, end) && isThisYear(start)

  return {
    singleDay: isSameDay(start, end),
    showTime: withinAWeek && !isPast(end),
    startDate: formatDate(start, excludeYear ? "dd. MMM" : "dd.MM.yyyy", { locale: nb }),
    endDate: formatDate(end, excludeYear ? "dd. MMM" : "dd.MM.yyyy", { locale: nb }),
    startTime: formatDate(start, "HH:mm", { locale: nb }),
    endTime: formatDate(end, "HH:mm", { locale: nb }),
    ongoing: isPast(start) && !isPast(end),
  }
}

interface EventListItemDateAndTimeProps {
  start: Date
  end: Date
}

export const DateAndTime: FC<EventListItemDateAndTimeProps> = ({ start, end }) => {
  const { singleDay, showTime, startDate, endDate, startTime, endTime, ongoing } = useDateFormats(start, end)
  const past = isPast(end)

  const ongoingBadge = (
    <Badge
      variant="light"
      color="slate"
      className="px-1.5 bg-gray-100 dark:bg-stone-800 group-hover:bg-gray-200 dark:group-hover:bg-stone-700 transition-color text-[0.65rem] font-semibold text-gray-500 uppercase tracking-wider"
    >
      Pågående
    </Badge>
  )

  if (singleDay) {
    return (
      <div
        className={cn(
          "flex flex-row gap-2 items-center dark:text-stone-400",
          past && "text-gray-600 dark:text-stone-700 group-hover:text-gray-800 dark:group-hover:text-stone-500"
        )}
      >
        <div className="flex flex-row gap-2 items-center">
          <Icon icon="tabler:calendar-event" className={cn(!past && "text-gray-800 dark:text-stone-500")} />
          <Text className="text-sm">{startDate}</Text>
        </div>

        {showTime && (
          <div className="flex flex-row gap-2 items-center">
            <Icon icon="tabler:clock" className={cn("ml-2", !past && "text-gray-800 dark:text-stone-800")} />
            <Text className="text-sm">
              {startTime} - {endTime}
            </Text>
          </div>
        )}

        {ongoing && ongoingBadge}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-row gap-2 items-center dark:text-stone-400",
        past && "text-gray-600 group-hover:text-gray-800 dark:text-stone-700 dark:group-hover:text-stone-500"
      )}
    >
      <Icon icon="tabler:calendar-event" className={cn(!past && "text-gray-800 dark:text-stone-500")} />

      <div className="flex flex-row gap-1 text-sm">
        <Text>{startDate}</Text>
        {showTime && <Text> kl. {startTime}</Text>}
      </div>

      <Icon icon="tabler:arrow-right" className={cn(!past && "text-gray-800 dark:text-stone-400")} />

      <div className="flex flex-row gap-1 text-sm">
        <Text>{endDate}</Text>
        {showTime && <Text>kl. {endTime}</Text>}
      </div>

      {ongoing && ongoingBadge}
    </div>
  )
}
