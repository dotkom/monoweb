"use client"

import { DateTooltip } from "@admin/components/DateTooltip"
import { CopyButton } from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import type { CommitteeApplicationInterviewAttendee } from "@dotkomonline/rpc/committee-application"
import { Avatar, AvatarFallback, AvatarImage, cn, Text } from "@dotkomonline/ui"
import { IconLink, IconMapPin } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import type { ReactNode } from "react"

export interface ApplicantInterview {
  startsAt: Date
  endsAt: Date
  locationName: string
  locationUrl: string | null
  attendees: CommitteeApplicationInterviewAttendee[]
}

type OptionalInterview = ApplicantInterview | null | undefined

const MINUTES_PER_HOUR = 60

export interface Interval {
  startsAt: Date
  endsAt: Date
}

export const formatInterval = (interval: Interval) =>
  `${formatDate(interval.startsAt, "EEEE d. MMM HH:mm", { locale: nb })}–${formatDate(interval.endsAt, "HH:mm")}`

export const EmptyCell = ({ children }: { children: ReactNode }) => (
  <Text className="text-sm italic text-muted-foreground">{children}</Text>
)

export const NumberCell = ({ children }: { children: ReactNode }) => (
  <Text className="text-sm tabular-nums">{children}</Text>
)

interface TextCellProps {
  value: string | null
  emptyLabel: string
}

export const TextCell = ({ value, emptyLabel }: TextCellProps) =>
  value === null || value === "" ? <EmptyCell>{emptyLabel}</EmptyCell> : <Text className="text-sm">{value}</Text>

export const DurationCell = ({ minutes }: { minutes: number }) => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR)
  const remainingMinutes = minutes % MINUTES_PER_HOUR

  if (hours === 0) {
    return <NumberCell>{remainingMinutes}min</NumberCell>
  }

  if (remainingMinutes === 0) {
    return <NumberCell>{hours}t</NumberCell>
  }

  return (
    <NumberCell>
      {hours}t {remainingMinutes}min
    </NumberCell>
  )
}

interface DateCellProps {
  date: Date | null
  emptyLabel: string
}

export const DateCell = ({ date, emptyLabel }: DateCellProps) =>
  date === null ? <EmptyCell>{emptyLabel}</EmptyCell> : <DateTooltip date={date} />

export const AvailabilityIntervals = ({ availability }: { availability: Interval[] }) => {
  if (availability.length === 0) {
    return <Text className="text-sm text-muted-foreground">Ingen tider satt opp</Text>
  }

  return (
    <div className="flex flex-col gap-0.5">
      {availability.map((interval) => (
        <Text key={interval.startsAt.toISOString()} className="text-sm text-muted-foreground">
          {formatInterval(interval)}
        </Text>
      ))}
    </div>
  )
}

export const CopyableLink = ({ url, className }: { url: string; className?: string }) => (
  <div className={cn("flex min-w-0 items-center gap-1.5 text-sm", className)}>
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex min-w-0 items-center gap-1.5 text-blue-600 hover:underline dark:text-blue-400"
    >
      <IconLink className="size-3.5 shrink-0" stroke={2} />
      <span className="truncate">{url}</span>
    </a>

    <CopyButton value={url} iconOnly />
  </div>
)

export const InterviewLocation = ({ interview }: { interview: OptionalInterview }) => {
  if (interview === null || interview === undefined) {
    return <EmptyCell>Ingen rom</EmptyCell>
  }

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <Text element="span" className="flex shrink-0 items-center gap-1.5">
        <IconMapPin className="size-3.5 shrink-0 opacity-45" stroke={2} />
        {interview.locationName}
      </Text>

      {interview.locationUrl !== null && (
        <div className="min-w-0 max-w-[50%]">
          <CopyableLink url={interview.locationUrl} />
        </div>
      )}
    </div>
  )
}

const toInitials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter((part) => part !== "")
    .slice(0, 2)
    .map((part) => part.at(0)?.toUpperCase() ?? "")
    .join("") || "?"

const ATTENDEE_SIZE_CLASSES = {
  sm: { row: "gap-1.5", avatar: "size-5", name: "text-xs" },
  md: { row: "gap-2", avatar: "size-6", name: "text-sm" },
}

interface InterviewAttendeeProps {
  attendee: CommitteeApplicationInterviewAttendee
  size?: keyof typeof ATTENDEE_SIZE_CLASSES
}

export const InterviewAttendee = ({ attendee, size = "md" }: InterviewAttendeeProps) => {
  const classes = ATTENDEE_SIZE_CLASSES[size]

  return (
    <div className={cn("flex min-w-0 items-center", classes.row)}>
      <Avatar className={classes.avatar}>
        {attendee.imageUrl !== null && <AvatarImage src={attendee.imageUrl} />}
        <AvatarFallback>{toInitials(attendee.name)}</AvatarFallback>
      </Avatar>
      <Text element="span" className={cn("truncate", classes.name)}>
        {attendee.name}
      </Text>
    </div>
  )
}

interface InterviewAttendeesProps {
  attendees: CommitteeApplicationInterviewAttendee[]
  emptyLabel?: string
}

export const InterviewAttendees = ({ attendees, emptyLabel = "Ingen" }: InterviewAttendeesProps) => {
  if (attendees.length === 0) {
    return <EmptyCell>{emptyLabel}</EmptyCell>
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {attendees.map((attendee) => (
        <InterviewAttendee key={attendee.userId} attendee={attendee} />
      ))}
    </div>
  )
}
