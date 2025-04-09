import { type Attendance, type AttendancePool, type Attendee, type User, canUserAttendPool } from "@dotkomonline/types"
import { formatDate } from "@dotkomonline/utils"
import clsx from "clsx"
import { addHours } from "date-fns"
import type { ComponentProps, FC } from "react"

interface Props {
  pool: AttendancePool
  attendee: Attendee | null
  user: User | null
  attendance: Attendance
}

const poolTitle = (pool: AttendancePool) => `${pool.yearCriteria.map((year) => `${year}.`).join(" og ")} klasse`

function CardWithTitle({ title, children, className, ...props }: ComponentProps<"div"> & { title: string }) {
  return (
    <div className={clsx("flex flex-col w-full bg-slate-3 rounded-2xl", className)} {...props}>
      <div className="px-8 pt-2 pb-1 bg-slate-5 rounded-t-2xl text-center text-sm font-bold">{title}</div>
      <div className="px-8 py-4 rounded-b-2xl flex flex-col gap-2 items-center justify-center">{children}</div>
    </div>
  )
}

export const AttendanceBoxPool: FC<Props> = ({ pool, user, attendee, attendance }) => {
  const canAttend = user && canUserAttendPool(pool, user)

  return (
    <CardWithTitle title={poolTitle(pool)} className={clsx(canAttend ? "col-span-2" : "col-span-1")}>
      {pool.capacity > 0 ? (
        <>
          <p className={canAttend ? "text-3xl" : "text-xl"}>
            {pool.numAttendees}/{pool.capacity}
          </p>
          {canAttend && <p>{attendee ? "Du er påmeldt" : "Du er ikke påmeldt"}</p>}
        </>
      ) : (
        <p className={clsx(canAttend ? "text-xl" : "text-lg", "py-2")}>
          {canAttend && pool.mergeDelayHours
            ? `Ledige plasser åpner ${formatDate(addHours(attendance.registerStart, pool.mergeDelayHours))}`
            : "Ledige plasser"}
        </p>
      )}
    </CardWithTitle>
  )
}
