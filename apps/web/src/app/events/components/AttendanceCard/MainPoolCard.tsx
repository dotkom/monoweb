import type {
  AttendancePool,
  AttendanceSelection,
  AttendanceSelectionResponse,
  AttendanceStatus,
  Attendee,
} from "@dotkomonline/types"
import { Card, Icon, Text, cn } from "@dotkomonline/ui"
import Link from "next/link.js"
import type { FC } from "react"
import { useSetSelectionsOptionsMutation } from "../mutations"
import { SelectionsForm } from "./SelectionsForm"

const getCardBackgroundColor = (isAttending: boolean, isReserved: boolean, darker?: boolean) => {
  if (isAttending && isReserved) {
    return darker ? "bg-green-5" : "bg-green-4"
  }

  if (isAttending && !isReserved) {
    return darker ? "bg-yellow-5" : "bg-yellow-4"
  }

  return darker ? "bg-slate-5" : "bg-slate-3"
}

const getAttendanceStatusText = (isAttending: boolean, isReserved: boolean, queuePosition: number | null) => {
  if (isAttending && isReserved) {
    return "Du er påmeldt"
  }

  if (isAttending && !isReserved) {
    // Should never happen, but just in case
    if (!queuePosition) {
      return "Du er i køen"
    }

    return `Du er ${queuePosition}. i køen`
  }

  return "Du er ikke påmeldt"
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
      <Card size="lg" variant="solid" smallRounding centerContent className="min-h-[10rem]">
        <Text>Du er ikke innlogget</Text>
      </Card>
    )
  }

  const isAttending = Boolean(attendee)

  if (!hasMembership && !isAttending) {
    return (
      <Card size="lg" variant="solid" smallRounding centerContent className="min-h-[10rem]">
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
      <Card size="lg" variant="solid" smallRounding centerContent className="min-h-[10rem]">
        <Text>Du kan ikke melde deg på dette arrangementet</Text>
      </Card>
    )
  }

  const isReserved = Boolean(attendee?.reserved)
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

  const cardTitleBackground = getCardBackgroundColor(isAttending, isReserved, true)
  const cardBackground = getCardBackgroundColor(isAttending, isReserved)

  return (
    <Card
      size="lg"
      variant="solid"
      smallRounding
      centerContent
      title={<Text>TEST</Text>}
      className={cardBackground}
      titleClassName={cardTitleBackground}
    >
      <Text className={cn("text-3xl px-2 py-1", poolHasQueue && isAttending && isReserved && "bg-green-5 rounded-lg")}>
        {pool.numAttendees}/{pool.capacity}
      </Text>

      {pool.numUnreservedAttendees > 0 && (
        <Text className={cn("text-lg px-2 py-0.5", isAttending && !isReserved && "bg-yellow-5 rounded-lg")}>
          +{pool.numUnreservedAttendees} i kø
        </Text>
      )}

      <Text>{getAttendanceStatusText(isAttending, isReserved, queuePosition)}</Text>

      {isAttending && isReserved && attendanceSelections.length > 0 && (
        <div className="w-full mt-2">
          <SelectionsForm
            selections={attendanceSelections}
            // biome-ignore lint/style/noNonNullAssertion: isAttending is true if attendee exists
            defaultValues={{ options: attendee!.selections }}
            onSubmit={handleSelectionChange}
            disabled={status === "Closed"}
          />
        </div>
      )}
    </Card>
  )
}
