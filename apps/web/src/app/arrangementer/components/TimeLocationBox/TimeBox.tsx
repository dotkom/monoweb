import type { Event } from "@dotkomonline/rpc/event"
import { Text } from "@dotkomonline/ui"
import { IconArrowRight } from "@tabler/icons-react"
import { format as formatDate, isSameDay, isSameYear, isThisYear } from "date-fns"
import { nb } from "date-fns/locale"
import type { FC } from "react"
import { CalendarBox } from "@/components/atoms/CalendarBox"
import { capitalizeFirstLetter } from "@dotkomonline/utils"

interface TimeBoxProps {
  event: Event
}

export const TimeBox: FC<TimeBoxProps> = ({ event }) => {
  const { start, end } = event

  const sameDay = isSameDay(start, end)
  const showYear = !isSameYear(start, end) || !isThisYear(start) || !isThisYear(end)

  const shortDate = (date: Date) => formatDate(date, showYear ? "dd.MM.yyyy" : "dd. MMM", { locale: nb })
  const longDate = (date: Date) =>
    capitalizeFirstLetter(formatDate(date, showYear ? "dd.MM.yyyy" : "EEEE dd. MMMM", { locale: nb }))

  return (
    <section className="flex w-full min-w-0 flex-row items-center gap-3 p-2 -mx-2 sm:gap-4">
      <CalendarBox
        start={start}
        end={end}
        className="shrink-0 bg-background dark:border-stone-700"
        containerClassName="shrink-0"
      />

      {sameDay ? (
        <div className="flex min-w-0 flex-col">
          <Text className="truncate">{longDate(start)}</Text>
          <Text className="truncate">
            kl. {formatDate(start, "HH:mm", { locale: nb })} - {formatDate(end, "HH:mm", { locale: nb })}
          </Text>
        </div>
      ) : (
        <div className="flex min-w-0 flex-row items-center gap-x-2 sm:gap-x-4">
          <div className="flex min-w-0 flex-col">
            <Text className="truncate text-xs text-muted-foreground">{shortDate(start)}</Text>
            <Text className="truncate">{capitalizeFirstLetter(formatDate(start, "EEEE", { locale: nb }))}</Text>
            <Text className="truncate">kl. {formatDate(start, "HH:mm", { locale: nb })}</Text>
          </div>

          <IconArrowRight className="size-5 shrink-0 text-muted-foreground sm:size-6" />

          <div className="flex min-w-0 flex-col">
            <Text className="truncate text-xs text-muted-foreground">{shortDate(end)}</Text>
            <Text className="truncate">{capitalizeFirstLetter(formatDate(end, "EEEE", { locale: nb }))}</Text>
            <Text className="truncate">kl. {formatDate(end, "HH:mm", { locale: nb })}</Text>
          </div>
        </div>
      )}
    </section>
  )
}
