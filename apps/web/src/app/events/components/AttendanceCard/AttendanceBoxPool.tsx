import type { AttendancePool } from "@dotkomonline/types"
import { Icon, Text } from "@dotkomonline/ui"
import clsx from "clsx"
import Link from "next/link.js"
import type { FC } from "react"

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

const Card: FC<{
  classNames?: { outer?: string; inner?: string; header?: string }
  title?: string
  children: React.ReactNode
}> = ({ classNames: className, children, title }) => {
  const baseOuterClassName = "flex flex-col w-full min-h-[8rem] bg-slate-3 rounded-lg"
  const baseHeaderClassName = "px-4 py-3 bg-slate-5 rounded-t-lg text-center text-sm font-bold"
  const baseInnerClassName = "flex flex-grow flex-col gap-2 p-4 items-center text-center justify-center w-full"

  if (!title) {
    return <section className={clsx(baseOuterClassName, baseInnerClassName, className?.inner)}>{children}</section>
  }

  return (
    <section className={clsx(baseOuterClassName, className?.outer)}>
      <div className={clsx(baseHeaderClassName, className?.header)}>
        <Text className="font-semibold">{title}</Text>
      </div>
      <div className={clsx(baseInnerClassName, "rounded-b-lg", className?.inner)}>{children}</div>
    </section>
  )
}

interface Props {
  pool: AttendancePool | undefined | null
  isAttending: boolean
  isLoggedIn: boolean
  queuePosition: number | null
  hasMembership?: boolean
}

export const AttendanceBoxPool: FC<Props> = ({ pool, isAttending, queuePosition, isLoggedIn, hasMembership }) => {
  if (!isLoggedIn) {
    return (
      <Card>
        <Text>Du er ikke innlogget</Text>
      </Card>
    )
  }

  if (!hasMembership) {
    return (
      <Card>
        <Text>Du har ikke registert medlemskap</Text>
        <div className="flex gap-[0.5ch] text-sm">
          <Text>Gå til</Text>
          <Link href="/profile" className="flex items-center text-blue-11 hover:text-blue-9">
            <Text>profilsiden</Text> <Icon icon="tabler:arrow-up-right" />
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

  return (
    <Card
      classNames={{
        outer: isAttendingAndReserved ? "bg-green-4" : isAttendingAndNotReserved ? "bg-yellow-4" : "bg-slate-3",
        inner: isAttendingAndReserved ? "bg-green-5" : isAttendingAndNotReserved ? "bg-yellow-5" : "bg-slate-5",
      }}
      title={pool.title}
    >
      <Text className={clsx("text-3xl px-2 py-1", poolHasQueue && isAttendingAndReserved && "bg-green-5 rounded-lg")}>
        {pool.numAttendees}/{pool.capacity}
      </Text>
      {pool.numUnreservedAttendees > 0 && (
        <Text className={clsx("text-lg px-2 py-0.5", isAttendingAndNotReserved && "bg-yellow-5 rounded-lg")}>
          +{pool.numUnreservedAttendees} i kø
        </Text>
      )}
      <Text>{getAttendanceStatusText(isAttendingAndReserved, isAttendingAndNotReserved, queuePosition)}</Text>
    </Card>
  )
}
