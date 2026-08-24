import { Text, cn } from "@dotkomonline/ui"
import { capitalizeFirstLetter } from "@dotkomonline/utils"
import { IconArrowRight } from "@tabler/icons-react"
import { formatDate, isSameDay, isSameMonth, isSameYear, isThisYear } from "date-fns"
import { nb } from "date-fns/locale"

interface CalendarBoxProps {
  start: Date
  end: Date
  className?: string
  containerClassName?: string
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
  month: formatDate(date, "MMM", { locale: nb }).replace(".", ""),
  day: formatDate(date, "dd", { locale: nb }),
})

const CalendarPage = ({
  monthLabel,
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
      "flex h-fit min-w-8 flex-col items-center rounded-md border border-gray-200 dark:border-stone-700",
      className
    )}
  >
    <div
      className={cn(
        "flex w-full flex-row justify-center rounded-t-sm bg-gray-200 py-px dark:bg-stone-700",
        titleClassName
      )}
    >
      <Text
        className={cn("text-[0.625rem] font-medium uppercase tracking-tight text-muted-foreground", titleTextClassName)}
      >
        {monthLabel}
      </Text>
    </div>

    <div className={cn("flex flex-row items-baseline px-1 py-0.5", dayClassName)}>
      <div className="flex flex-col items-center">
        <Text className={cn("text-base/4", dayTextClassName)}>{startDay}</Text>
        {includeWeekday && (
          <Text className={cn("text-[0.625rem]/3 text-muted-foreground", weekdayTextClassName)}>{startDayWeekday}</Text>
        )}
      </div>

      {endDay && (
        <>
          <IconArrowRight className={cn("size-3 text-muted-foreground", arrowClassName)} />
          <div className="flex flex-col items-center">
            <Text className={cn("text-base/4", dayTextClassName)}>{endDay}</Text>
            {includeWeekday && (
              <Text className={cn("text-[0.625rem]/3 text-muted-foreground", weekdayTextClassName)}>
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
  containerClassName,
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

  const sharedPageProps = {
    titleClassName,
    titleTextClassName,
    dayClassName,
    dayTextClassName,
    weekdayTextClassName,
    arrowClassName,
    includeWeekday,
  }

  const showYear = !isSameYear(start, end) || !thisYear
  const startMonthLabel = showYear ? `${startDate.month} ${startDate.year}` : startDate.month
  const endMonthLabel = showYear ? `${endDate.month} ${endDate.year}` : endDate.month

  if (isSameDay(start, end)) {
    return (
      <CalendarPage
        {...sharedPageProps}
        monthLabel={startMonthLabel}
        startDay={startDate.day}
        startDayWeekday={startDayWeekday}
        className={cn("min-w-11 dark:border-stone-800", className)}
        titleClassName={cn("dark:bg-stone-800", titleClassName)}
      />
    )
  }

  if (isSameMonth(start, end)) {
    return (
      <CalendarPage
        {...sharedPageProps}
        monthLabel={startMonthLabel}
        startDay={startDate.day}
        startDayWeekday={startDayWeekday}
        endDay={endDate.day}
        endDayWeekday={endDayWeekday}
        className={cn("min-w-11 dark:border-stone-800", className)}
        titleClassName={cn("dark:bg-stone-800", titleClassName)}
        dayClassName={cn("px-2", dayClassName)}
      />
    )
  }

  return (
    <div className={cn("flex flex-row items-center gap-0.5", containerClassName)}>
      <CalendarPage
        {...sharedPageProps}
        monthLabel={startMonthLabel}
        startDay={startDate.day}
        startDayWeekday={startDayWeekday}
        className={cn("dark:border-stone-800", className)}
        titleClassName={cn("dark:bg-stone-800", showYear && "px-1", titleClassName)}
        titleTextClassName={cn(showYear && "text-nowrap", titleTextClassName)}
      />

      <IconArrowRight className={cn("size-3.5 text-muted-foreground", arrowClassName)} />

      <CalendarPage
        {...sharedPageProps}
        monthLabel={endMonthLabel}
        startDay={endDate.day}
        startDayWeekday={endDayWeekday}
        className={cn("dark:border-stone-800", className)}
        titleClassName={cn("dark:bg-stone-800", showYear && "px-1", titleClassName)}
        titleTextClassName={cn(showYear && "text-nowrap", titleTextClassName)}
      />
    </div>
  )
}
