"use client"

import { DateTooltip } from "@admin/components/DateTooltip"
import { CopyButton } from "@admin/components/ResourceDetailLayout/ResourceDetailLayout"
import type { CommitteeApplicationInterviewAttendee } from "@dotkomonline/rpc/committee-application"
import { Avatar, AvatarFallback, AvatarImage, cn, Text } from "@dotkomonline/ui"
import { IconMapPin } from "@tabler/icons-react"
import { formatDate } from "date-fns"
import { nb } from "date-fns/locale"
import type { ReactNode } from "react"

export type ApplicantInterview = {
  startsAt: Date
  endsAt: Date
  locationName: string
  locationUrl: string | null
  attendees: CommitteeApplicationInterviewAttendee[]
}

type Interval = { startsAt: Date; endsAt: Date }

const ATTENDEE_SIZE_CLASSES = {
  sm: { row: "gap-1.5", avatar: "size-5", name: "text-xs" },
  md: { row: "gap-2", avatar: "size-6", name: "text-sm" },
}

export const formatInterval = ({ startsAt, endsAt }: Interval) =>
  `${formatDate(startsAt, "EEEE d. MMM HH:mm", { locale: nb })}–${formatDate(endsAt, "HH:mm")}`

const toInitials = (name: string) =>
  name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?"

export const EmptyCell = ({ children }: { children: ReactNode }) => (
  <Text className="text-sm italic text-muted-foreground">{children}</Text>
)

export const NumberCell = ({ children }: { children: ReactNode }) => (
  <Text className="text-sm tabular-nums">{children}</Text>
)

export const TextCell = ({ value, emptyLabel }: { value: string | null; emptyLabel: string }) =>
  value ? <Text className="text-sm">{value}</Text> : <EmptyCell>{emptyLabel}</EmptyCell>

export const DateCell = ({ date, emptyLabel }: { date: Date | null; emptyLabel: string }) =>
  date === null ? <EmptyCell>{emptyLabel}</EmptyCell> : <DateTooltip date={date} />

export const DurationCell = ({ minutes }: { minutes: number }) => {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  return (
    <NumberCell>
      {[hours > 0 && `${hours}t`, (rest > 0 || hours === 0) && `${rest}min`].filter(Boolean).join(" ")}
    </NumberCell>
  )
}

export const AvailabilityIntervals = ({ availability }: { availability: Interval[] }) => (
  <div className="flex flex-col gap-0.5 text-sm text-muted-foreground">
    {availability.length === 0 ? (
      <Text>Ingen tider satt opp</Text>
    ) : (
      availability.map((interval) => <Text key={interval.startsAt.toISOString()}>{formatInterval(interval)}</Text>)
    )}
  </div>
)

export const InterviewLocation = ({ interview }: { interview?: ApplicantInterview | null }) =>
  interview ? (
    <div className="flex min-w-0 items-center gap-2 text-sm">
      <Text element="span" className="flex shrink-0 items-center gap-1.5">
        <IconMapPin className="size-3.5 shrink-0 opacity-45" stroke={2} />
        {interview.locationName}
      </Text>
      {interview.locationUrl !== null && <CopyButton value={interview.locationUrl} label="Kopier Mazemap-link" compact />}
    </div>
  ) : (
    <EmptyCell>Ingen rom</EmptyCell>
  )

export const InterviewAttendee = ({
  attendee,
  size = "md",
}: {
  attendee: CommitteeApplicationInterviewAttendee
  size?: keyof typeof ATTENDEE_SIZE_CLASSES
}) => {
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

export const InterviewAttendees = ({
  attendees,
  emptyLabel = "Ingen",
}: {
  attendees: CommitteeApplicationInterviewAttendee[]
  emptyLabel?: string
}) =>
  attendees.length === 0 ? (
    <EmptyCell>{emptyLabel}</EmptyCell>
  ) : (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {attendees.map((attendee) => (
        <InterviewAttendee key={attendee.userId} attendee={attendee} />
      ))}
    </div>
  )
