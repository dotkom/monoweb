import type { AttendancePool } from "@dotkomonline/types"
import { Text } from "@dotkomonline/ui"
import clsx from "clsx"
import type { FC } from "react"

interface Props {
  pool: AttendancePool | undefined | null
  isAttending: boolean
  queuePosition: number | null
}

export const AttendanceBoxPool: FC<Props> = ({ pool, isAttending, queuePosition }) => {
  if (!pool) {
    return (
      <div className="flex flex-col w-full bg-slate-3 rounded-lg">
        <div className="px-8 pt-2 pb-2 bg-slate-5 rounded-t-lg text-center text-sm uppercase font-bold">
          <Text>Ingen gruppe</Text>
        </div>
        <div className="px-8 py-4 flex flex-col items-center justify-center min-h-[6rem]">
          <Text>Du kan ikke melde deg på dette arrangementet</Text>
        </div>
      </div>
    )
  }

  const isAttendingAndReserved = isAttending && queuePosition === undefined
  const isAttendingAndNotReserved = isAttending && queuePosition !== undefined

  return (
    <div
      className={clsx(
        "flex flex-col w-full rounded-lg",
        isAttendingAndReserved ? "bg-green-4" : isAttendingAndNotReserved ? "bg-yellow-4" : "bg-slate-3"
      )}
    >
      <div
        className={clsx(
          "px-4 py-3 rounded-t-lg text-center text-sm font-bold",
          isAttendingAndReserved ? "bg-green-5" : isAttendingAndNotReserved ? "bg-yellow-5" : "bg-slate-5"
        )}
      >
        <Text className="font-semibold">{pool.title}</Text>
      </div>
      <div className="px-4 py-4 rounded-b-lg flex flex-col gap-2 items-center justify-center min-h-[6rem] w-full">
        <Text className={clsx("text-3xl px-2 py-1", isAttendingAndReserved && "bg-green-5 rounded-lg")}>
          {pool.numAttendees}/{pool.capacity}
        </Text>
        {pool.numUnreservedAttendees > 0 && (
          <Text className={clsx("text-lg px-2 py-0.5", isAttendingAndNotReserved && "bg-yellow-5 rounded-lg")}>
            +{pool.numUnreservedAttendees} i kø
          </Text>
        )}
        <Text>
          {isAttendingAndReserved
            ? "Du er påmeldt"
            : isAttendingAndNotReserved
              ? queuePosition
                ? `Du er ${queuePosition}. i køen`
                : "Du er i køen"
              : "Du er ikke påmeldt"}
        </Text>
      </div>
    </div>
  )
}
