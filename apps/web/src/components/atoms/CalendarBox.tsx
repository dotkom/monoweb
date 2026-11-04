import { Text, cn } from "@dotkomonline/ui"
import { capitalizeFirstLetter } from "@dotkomonline/utils"
import { IconArrowRight } from "@tabler/icons-react"
import { formatDate, isSameDay, isSameMonth, isSameYear, isThisYear } from "date-fns"
import { nb } from "date-fns/locale"

interface CalendarBoxProps {
  start: Date
  end: Date
  className?: string
  titleClassName?: string
  titleTextClassName?: string
  dayClassName?: string
  dayTextClassName?: string
  weekdayTextClassName?: string
  arrowClassName?: string
  includeWeekday?: boolean
}

interface CalendarDateParts {
  year: string
  month: string
  day: string
}

interface CalendarPageProps {
  monthLabel: string
  endMonthLabel?: string
  showYear: boolean
  startDay: string
  endDay?: string
  startDayWeekday?: string
  endDayWeekday?: string
  className?: string
  titleClassName?: string
  titleTextClassName?: string
  dayClassName?: string
  dayTextClassName?: string
  weekdayTextClassName?: string
  arrowClassName?: string
  includeWeekday?: boolean
}

const getCalendarDateParts = (date: Date): CalendarDateParts => ({
  year: formatDate(date, "yy", { locale: nb }),
  month: formatDate(date, "MMM", { locale: nb }).replace(".", "").slice(0, 3),
  day: formatDate(date, "dd", { locale: nb }),
})

const CalendarPage = ({
  monthLabel,
  endMonthLabel,
  showYear,
  startDay,
  endDay,
  startDayWeekday,
  endDayWeekday,
  className,
  titleClassName,
  titleTextClassName,
  dayClassName,
  dayTextClassName,
  weekdayTextClassName,
  arrowClassName,
  includeWeekday,
}: CalendarPageProps) => (
  <div
    className={cn(
      "flex min-h-11 h-fit min-w-11 flex-col items-center rounded-md border border-gray-200 dark:border-stone-800",
      endDay && "grid w-16 grid-cols-[1fr_auto_1fr] grid-rows-[auto_1fr] items-stretch",
      endMonthLabel && showYear && "w-22.5",
      className
    )}
  >
    <div
      className={cn(
        "flex w-full flex-row justify-center rounded-t-sm bg-gray-200 py-px dark:bg-stone-800",
        endDay && "col-span-3 px-1.5",
        endMonthLabel && "grid grid-cols-subgrid items-center",
        titleClassName
      )}
    >
      <Text
        className={cn(
          "text-center text-[0.625rem] font-mono [word-spacing:-0.25em] font-medium uppercase tracking-tight text-muted-foreground",
          endMonthLabel && "whitespace-nowrap",
          titleTextClassName
        )}
      >
        {monthLabel}
      </Text>
      {endMonthLabel && (
        <Text
          className={cn(
            "col-start-3 whitespace-nowrap text-center text-[0.625rem] font-mono [word-spacing:-0.25em] font-medium uppercase tracking-tight text-muted-foreground",
            titleTextClassName
          )}
        >
          {endMonthLabel}
        </Text>
      )}
    </div>

    <div
      className={cn(
        "my-auto flex flex-row items-baseline px-1 py-0.5",
        endDay && "col-span-3 grid grid-cols-subgrid px-1.5",
        dayClassName
      )}
    >
      <div className="flex flex-col items-center">
        <Text className={cn("text-base/4 font-mono", dayTextClassName)}>{startDay}</Text>
        {includeWeekday && (
          <Text className={cn("text-[9px]/2 font-mono uppercase text-muted-foreground", weekdayTextClassName)}>
            {startDayWeekday}
          </Text>
        )}
      </div>

      {endDay && (
        <>
          <IconArrowRight className={cn("size-3 text-muted-foreground", arrowClassName)} />
          <div className="flex flex-col items-center">
            <Text className={cn("text-base/4 font-mono", dayTextClassName)}>{endDay}</Text>
            {includeWeekday && (
              <Text className={cn("text-[9px]/2 font-mono uppercase text-muted-foreground", weekdayTextClassName)}>
                {endDayWeekday}
              </Text>
            )}
          </div>
        </>
      )}
    </div>
  </div>
)

export const CalendarBox = ({
  start,
  end,
  className,
  titleClassName,
  titleTextClassName,
  dayClassName,
  dayTextClassName,
  weekdayTextClassName,
  arrowClassName,
  includeWeekday = false,
}: CalendarBoxProps) => {
  const thisYear = isThisYear(start) && isThisYear(end)

  const startDate = getCalendarDateParts(start)
  const endDate = getCalendarDateParts(end)

  const startDayWeekday = capitalizeFirstLetter(formatDate(start, "EEE", { locale: nb }))
  const endDayWeekday = capitalizeFirstLetter(formatDate(end, "EEE", { locale: nb }))

  const showYear = !isSameYear(start, end) || !thisYear

  const startMonthLabel = showYear ? `${startDate.month} ${startDate.year}` : startDate.month
  const endMonthLabel = showYear ? `${endDate.month} ${endDate.year}` : endDate.month

  const pageProps = {
    showYear,
    className,
    titleClassName,
    titleTextClassName,
    dayClassName,
    dayTextClassName,
    weekdayTextClassName,
    arrowClassName,
    includeWeekday,
    startDay: startDate.day,
    startDayWeekday,
    monthLabel: startMonthLabel,
  } as const satisfies Partial<CalendarPageProps>

  if (isSameDay(start, end)) {
    return <CalendarPage {...pageProps} />
  }

  if (isSameMonth(start, end)) {
    return <CalendarPage {...pageProps} endDay={endDate.day} endDayWeekday={endDayWeekday} />
  }

  return (
    <CalendarPage {...pageProps} endMonthLabel={endMonthLabel} endDay={endDate.day} endDayWeekday={endDayWeekday} />
  )
}
