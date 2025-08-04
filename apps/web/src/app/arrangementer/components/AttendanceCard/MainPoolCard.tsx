import type { AttendancePool, Attendee, Punishment } from "@dotkomonline/types"
import { Icon, Text, Title, cn } from "@dotkomonline/ui"
import { formatDistanceToNowStrict, isFuture } from "date-fns"
import { nb } from "date-fns/locale"
import Link from "next/link.js"
import type { FC, ReactNode } from "react"

const getAttendanceStatusText = (
  isAttendingAndReserved: boolean,
  isAttendingAndNotReserved: boolean,
  queuePosition: number | null
) => {
  if (isAttendingAndReserved) {
    return "Du er påmeldt"
  }

  if (isAttendingAndNotReserved) {
    // Should never happen, but just in case
    if (!queuePosition) {
      return "Du er i køen"
    }

    return `Du er ${queuePosition}. i køen`
  }

  return "Du er ikke påmeldt"
}

interface CardProps {
  classNames?: { outer?: string; inner?: string; title?: string }
  title?: string
  children: ReactNode
}

const Card: FC<CardProps> = ({ classNames, children, title }) => {
  const baseOuterClassName = "flex flex-col w-full bg-gray-100 dark:bg-stone-800 rounded-lg"
  const baseHeaderClassName = "p-2 bg-gray-200 dark:bg-stone-700/50 rounded-t-lg text-center text-sm font-bold"
  const baseInnerClassName =
    "flex flex-col min-h-[10rem] gap-2 p-2 rounded-md items-center text-center justify-center w-full"

  if (!title) {
    return <section className={cn(baseOuterClassName, baseInnerClassName, classNames?.inner)}>{children}</section>
  }

  return (
    <section className={cn(baseOuterClassName, classNames?.outer)}>
      <div className={cn(baseHeaderClassName, classNames?.title)}>
        <Title element="p" className="text-base">
          {title}
        </Title>
      </div>
      <div className={cn(baseInnerClassName, "rounded-b-lg", classNames?.inner)}>{children}</div>
    </section>
  )
}

interface MainPoolCardProps {
  pool: AttendancePool | undefined | null
  attendee: Attendee | undefined | null
  isLoggedIn: boolean
  queuePosition: number | null
  hasMembership: boolean
  punishment: Punishment | null
}

export const MainPoolCard: FC<MainPoolCardProps> = ({
  pool,
  attendee,
  queuePosition,
  isLoggedIn,
  hasMembership,
  punishment,
}) => {
  if (!isLoggedIn) {
    return (
      <Card>
        <Text>Du er ikke innlogget</Text>
      </Card>
    )
  }

  const isAttending = Boolean(attendee)

  if (!hasMembership && !isAttending) {
    return (
      <Card>
        <Text>Du har ikke registert medlemskap</Text>
        <div className="flex gap-[0.5ch] text-sm">
          <Text>Gå til</Text>
          <Link href="/profil" className="flex items-center text-blue-800 dark:text-blue-400 hover:underline">
            <Text>profilsiden</Text> <Icon icon="tabler:arrow-up-right" className="text-base" />
          </Link>
          <Text>for å registrere deg</Text>
        </div>
      </Card>
    )
  }

  if (!pool) {
    return (
      <Card>
        <Text>Du kan ikke melde deg på dette arrangementet</Text>
      </Card>
    )
  }

  const isAttendingAndReserved = isAttending && queuePosition === null
  const isAttendingAndNotReserved = isAttending && queuePosition !== null
  const poolHasQueue = pool.numUnreservedAttendees > 0
  const hasPunishment = punishment && (punishment.delay > 0 || punishment.suspended)

  return (
    <Card
      classNames={{
        outer: isAttendingAndReserved
          ? "bg-green-100 dark:bg-green-900"
          : isAttendingAndNotReserved
            ? "bg-yellow-100 dark:bg-yellow-800"
            : undefined,
        title: isAttendingAndReserved
          ? "bg-green-200 dark:bg-green-800"
          : isAttendingAndNotReserved
            ? "bg-yellow-200 dark:bg-yellow-700"
            : undefined,
      }}
      title={pool.title}
    >
      <div className="flex grow flex-col gap-2 items-center text-center justify-center">
        <Text
          className={cn(
            "text-3xl px-2 py-1",
            poolHasQueue && isAttendingAndReserved && "bg-green-200 dark:bg-green-800 rounded-lg"
          )}
        >
          {pool.numAttendees}/{pool.capacity}
        </Text>

        {poolHasQueue && (
          <Text
            className={cn(
              "text-lg px-2 py-0.5",
              isAttendingAndNotReserved && "bg-yellow-200 dark:bg-yellow-700 rounded-lg"
            )}
          >
            +{pool.numUnreservedAttendees} i kø
          </Text>
        )}

        <Text>{getAttendanceStatusText(isAttendingAndReserved, isAttendingAndNotReserved, queuePosition)}</Text>

        {attendee?.earliestReservationAt && isFuture(attendee.earliestReservationAt) && (
          <div className="flex flex-row gap-1 items-center mt-2 px-2 py-0.5 rounded-lg bg-black/5">
            <Icon icon="tabler:clock-hour-2" className="text-base" />
            <Text className={cn("text-sm")}>
              {formatDistanceToNowStrict(attendee?.earliestReservationAt, { locale: nb })} utsettelse
            </Text>
          </div>
        )}
      </div>
    </Card>
  )
}
