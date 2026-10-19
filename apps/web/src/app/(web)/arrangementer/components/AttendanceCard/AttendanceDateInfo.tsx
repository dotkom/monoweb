import { type AttendanceView, type Attendee, hasAttendeePaid } from "@dotkomonline/rpc/attendance"
import { Text, Timeline, TimelineContent, TimelineDot, TimelineItem, cn } from "@dotkomonline/ui"
import { capitalizeFirstLetter } from "@dotkomonline/utils"
import { IconLockFilled, IconPennantFilled, IconSquareRotatedFilled } from "@tabler/icons-react"
import { compareAsc, format as formatDate, isAfter, isEqual, isPast, isThisYear, min } from "date-fns"
import { nb } from "date-fns/locale"
import { AttendanceSection } from "./AttendanceSection"
import transitionStyles from "./AttendanceTransition.module.css"

const dateComponent = (label: string, date: Date, time: string, showNotice?: boolean) => {
  const shortDateString = formatDate(date, isThisYear(date) ? "dd. MMM" : "dd.MM.yyyy", { locale: nb })
  const longDateString = capitalizeFirstLetter(
    formatDate(date, isThisYear(date) ? "EEE dd. MMM" : "dd.MM.yyyy", { locale: nb })
  )

  return (
    <div className="flex flex-col text-base md:text-sm">
      <Text
        className={cn(
          "w-fit font-medium transition-colors duration-260 ease-smooth motion-reduce:transition-none",
          showNotice && "px-0.5 rounded-sm bg-yellow-100 dark:bg-yellow-600/25"
        )}
      >
        {label}
      </Text>

      <div className="flex flex-row gap-2 text-muted-foreground sm:flex-col sm:gap-0 sm:text-sm">
        <Text className="hidden md:hidden lg:inline">{longDateString}</Text>
        <Text className="hidden md:inline lg:hidden">{shortDateString}</Text>
        <Text className="inline md:hidden">{longDateString}</Text>
        <Text>kl. {time}</Text>
      </div>
    </div>
  )
}

const getNextDateBlock = (...entries: { key: string; date: Date }[]) => {
  const now = new Date()

  return entries.toSorted((a, b) => compareAsc(a.date, b.date)).find((entry) => isAfter(entry.date, now))?.key ?? null
}

interface AttendanceDateInfoProps {
  attendance: AttendanceView
  attendee: Attendee | null
  chargeScheduleDate?: Date | null
}

export const AttendanceDateInfo = ({ attendance, attendee, chargeScheduleDate }: AttendanceDateInfoProps) => {
  const { registerStart, registerEnd, deregisterDeadline } = attendance

  const actualDeregisterDeadline = chargeScheduleDate
    ? min([deregisterDeadline, chargeScheduleDate])
    : deregisterDeadline

  const hasPaid = hasAttendeePaid(attendee, attendance.attendancePrice) ?? false
  const showDeregisterDeadlineNotice = hasPaid && !isEqual(actualDeregisterDeadline, deregisterDeadline)

  const nextDateBlock = getNextDateBlock(
    { key: "registerStart", date: registerStart },
    { key: "registerEnd", date: registerEnd },
    { key: "deregisterDeadline", date: actualDeregisterDeadline }
  )

  const dateBlocks = [
    {
      key: "registerStart",
      date: registerStart,
      icon: (
        <IconPennantFilled
          className={cn("size-4", nextDateBlock === "registerStart" ? "text-foreground" : "text-muted-foreground")}
        />
      ),
      element: dateComponent(
        isPast(registerStart) ? "Åpnet" : "Åpner",
        registerStart,
        formatDate(registerStart, "HH:mm", { locale: nb }),
        false
      ),
    },
    {
      key: "registerEnd",
      date: registerEnd,
      icon: (
        <IconSquareRotatedFilled
          className={cn("size-4", nextDateBlock === "registerEnd" ? "text-foreground" : "text-muted-foreground")}
        />
      ),
      element: dateComponent(
        isPast(registerEnd) ? "Lukket" : "Lukker",
        registerEnd,
        formatDate(registerEnd, "HH:mm", { locale: nb }),
        false
      ),
    },
    {
      key: "deregisterDeadline",
      date: actualDeregisterDeadline,
      icon: (
        <IconLockFilled
          className={cn("size-4", nextDateBlock === "deregisterDeadline" ? "text-foreground" : "text-muted-foreground")}
        />
      ),
      element: dateComponent(
        "Avmeldingsfrist",
        actualDeregisterDeadline,
        formatDate(actualDeregisterDeadline, "HH:mm", { locale: nb }),
        showDeregisterDeadlineNotice
      ),
    },
  ]

  const sortedElements = dateBlocks.toSorted((firstBlock, secondBlock) => compareAsc(firstBlock.date, secondBlock.date))

  const element = (
    <Timeline orientation="horizontal" rail="segmented" bleed="both" color="gray" className="sm:grid-cols-3">
      {sortedElements.map(({ element, key, date, icon }) => (
        <TimelineItem key={key}>
          <TimelineDot render={icon} size={16} />
          <TimelineContent className="pt-0.5!">
            <div key={date.getTime()} className={transitionStyles.state}>
              {element}
            </div>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )

  return (
    <div className="flex flex-col gap-0">
      {element}
      <AttendanceSection className="mt-2">
        {showDeregisterDeadlineNotice && (
          <Text className="text-xs text-gray-500 dark:text-stone-500">Avmeldingsfrist er endret grunnet betaling.</Text>
        )}
      </AttendanceSection>
    </div>
  )
}
