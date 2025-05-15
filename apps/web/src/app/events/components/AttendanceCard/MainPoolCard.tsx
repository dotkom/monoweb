import type {
  AttendancePool,
  AttendanceSelection,
  AttendanceSelectionResponse,
  AttendanceStatus,
  Attendee,
} from "@dotkomonline/types"
import { Icon, Text, cn } from "@dotkomonline/ui"
import Link from "next/link.js"
import type { FC, ReactNode } from "react"
import { useSetSelectionsOptionsMutation } from "../mutations"
import { SelectionsForm } from "./SelectionsForm"

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
  const baseOuterClassName = "flex flex-col w-full min-h-[8rem] bg-slate-3 rounded-lg"
  const baseHeaderClassName = "px-4 py-3 bg-slate-5 rounded-t-lg text-center text-sm font-bold"
  const baseInnerClassName = "flex flex-col gap-4 p-3 items-center text-center justify-center w-full"

  if (!title) {
    return <section className={cn(baseOuterClassName, baseInnerClassName, classNames?.inner)}>{children}</section>
  }

  return (
    <section className={cn(baseOuterClassName, classNames?.outer)}>
      <div className={cn(baseHeaderClassName, classNames?.title)}>
        <Text className="font-semibold">{title}</Text>
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
  attendanceSelections: AttendanceSelection[]
  status: AttendanceStatus
}

export const MainPoolCard: FC<MainPoolCardProps> = ({
  pool,
  attendee,
  queuePosition,
  isLoggedIn,
  hasMembership,
  attendanceSelections,
  status,
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

  const selectionsMutation = useSetSelectionsOptionsMutation()
  const handleSelectionChange = (selections: AttendanceSelectionResponse[]) => {
    if (!attendee) {
      return
    }

    selectionsMutation.mutate({
      attendeeId: attendee.id,
      options: selections,
    })
  }

  return (
    <Card
      classNames={{
        outer: isAttendingAndReserved ? "bg-green-4" : isAttendingAndNotReserved ? "bg-yellow-4" : "bg-slate-3",
        title: isAttendingAndReserved ? "bg-green-5" : isAttendingAndNotReserved ? "bg-yellow-5" : "bg-slate-5",
      }}
      title={pool.title}
    >
      <div className="flex flex-grow flex-col gap-2 items-center text-center justify-center">
        <Text className={cn("text-3xl px-2 py-1", poolHasQueue && isAttendingAndReserved && "bg-green-5 rounded-lg")}>
          {pool.numAttendees}/{pool.capacity}
        </Text>
        {pool.numUnreservedAttendees > 0 && (
          <Text className={cn("text-lg px-2 py-0.5", isAttendingAndNotReserved && "bg-yellow-5 rounded-lg")}>
            +{pool.numUnreservedAttendees} i kø
          </Text>
        )}
        <Text>{getAttendanceStatusText(isAttendingAndReserved, isAttendingAndNotReserved, queuePosition)}</Text>
      </div>

      {isAttendingAndReserved && status !== "Closed" && attendanceSelections.length > 0 && (
        <div className="w-full mt-2">
          <SelectionsForm
            selections={attendanceSelections}
            // biome-ignore lint/style/noNonNullAssertion: isAttending is true if attendee exists
            defaultValues={{ options: attendee!.selections }}
            onSubmit={handleSelectionChange}
          />
        </div>
      )}
    </Card>
  )
}
