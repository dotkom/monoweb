import { Icon, cn } from "@dotkomonline/ui"

interface CalendarCellProps {
  isFirst?: boolean
  isLast?: boolean
}

const CalendarCell = ({ isFirst = false, isLast = false }: CalendarCellProps) => {
  return <div className={cn("border-gray-300 dark:border-stone-600", isLast && "sm:border-l-[1px]")} />
}

interface CalendarRowProps {
  isFirst?: boolean
}

const CalendarRow = ({ isFirst = false }: CalendarRowProps) => {
  return (
    <div
      className={cn(
        "grid grid-cols-7 sm:grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] bottom-0 top-0 w-full h-full min-h-24 sm:min-h-28 border-t-[1px] border-gray-300 dark:border-stone-600",
        isFirst && "sm:border-t-0"
      )}
    >
      <div className="hidden sm:flex w-6 pr-2 items-center justify-center text-gray-600 dark:text-stone-400 text-xs" />
      <CalendarCell />
      <CalendarCell isLast />
      <CalendarCell isLast />
      <CalendarCell isLast />
      <CalendarCell isLast />
      <CalendarCell isLast />
      <CalendarCell isLast />
    </div>
  )
}

export const CalendarSkeleton = () => {
  const weekdays = ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"]

  return (
    <div className="relative">
      <Icon
        className="animate-spin absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        icon="tabler:loader-2"
        width={40}
        height={40}
      />
      <div className="grid grid-cols-7 sm:grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr]">
        <div className="hidden sm:block w-6 pr-2 text-gray-600 dark:text-stone-400 text-xs leading-5" />
        {weekdays.map((day) => (
          <div
            key={day}
            className="text-center sm:text-end sm:pr-3 leading-5 text-gray-600 dark:text-stone-400 text-xs"
          >
            <span className="sm:hidden">{day[0]}</span>
            <span className="hidden sm:block">{day}</span>
          </div>
        ))}
      </div>
      <CalendarRow isFirst />
      <CalendarRow />
      <CalendarRow />
      <CalendarRow />
    </div>
  )
}
