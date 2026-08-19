import { Text, cn } from "@dotkomonline/ui"
import { IconArrowRight } from "@tabler/icons-react"
import { formatDate, isSameDay, isSameMonth, isSameYear } from "date-fns"
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
  arrowClassName?: string
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
  className?: string
  titleClassName?: string
  titleTextClassName?: string
  dayClassName?: string
  dayTextClassName?: string
  arrowClassName?: string
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
  className,
  titleClassName,
  titleTextClassName,
  dayClassName,
  dayTextClassName,
  arrowClassName,
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

    <div className={cn("flex flex-row items-center px-1 py-0.5", dayClassName)}>
      <Text className={cn("text-base", dayTextClassName)}>{startDay}</Text>

      {endDay && (
        <>
          <IconArrowRight className={cn("size-3 text-muted-foreground", arrowClassName)} />
          <Text className={cn("text-base", dayTextClassName)}>{endDay}</Text>
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
  arrowClassName,
}: CalendarBoxProps) => {
  const startDate = getCalendarDateParts(start)
  const endDate = getCalendarDateParts(end)

  const sharedPageProps = {
    titleClassName,
    titleTextClassName,
    dayClassName,
    dayTextClassName,
    arrowClassName,
  }

  if (isSameDay(start, end)) {
    return (
      <CalendarPage
        {...sharedPageProps}
        monthLabel={startDate.month}
        startDay={startDate.day}
        className={cn("min-w-11 dark:border-stone-800", className)}
        titleClassName={cn("dark:bg-stone-800", titleClassName)}
      />
    )
  }

  if (isSameMonth(start, end)) {
    return (
      <CalendarPage
        {...sharedPageProps}
        monthLabel={startDate.month}
        startDay={startDate.day}
        endDay={endDate.day}
        className={cn("min-w-11 dark:border-stone-800", className)}
        titleClassName={cn("dark:bg-stone-800", titleClassName)}
        dayClassName={cn("px-2", dayClassName)}
      />
    )
  }

  const datesShareYear = isSameYear(start, end)
  const startMonthLabel = datesShareYear ? startDate.month : `${startDate.month} ${startDate.year}`
  const endMonthLabel = datesShareYear ? endDate.month : `${endDate.month} ${endDate.year}`

  return (
    <div className={cn("flex flex-row items-center gap-0.5", containerClassName)}>
      <CalendarPage
        {...sharedPageProps}
        monthLabel={startMonthLabel}
        startDay={startDate.day}
        className={cn("dark:border-stone-800", className)}
        titleClassName={cn("dark:bg-stone-800", !datesShareYear && "px-1", titleClassName)}
        titleTextClassName={cn(!datesShareYear && "text-nowrap", titleTextClassName)}
      />

      <IconArrowRight className={cn("size-3.5 text-muted-foreground", arrowClassName)} />

      <CalendarPage
        {...sharedPageProps}
        monthLabel={endMonthLabel}
        startDay={endDate.day}
        className={cn("dark:border-stone-800", className)}
        titleClassName={cn("dark:bg-stone-800", !datesShareYear && "px-1", titleClassName)}
        titleTextClassName={cn(!datesShareYear && "text-nowrap", titleTextClassName)}
      />
    </div>
  )
}
