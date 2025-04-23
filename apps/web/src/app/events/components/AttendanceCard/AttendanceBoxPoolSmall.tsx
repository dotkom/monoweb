import type { AttendancePool } from "@dotkomonline/types"
import { formatRelativeTime } from "@dotkomonline/utils"
import { addHours } from "date-fns"

interface Props {
  pool: AttendancePool
  attendanceStart: Date
}

export const AttendanceBoxPoolSmall = ({ pool, attendanceStart }: Props) => {
  const isUnprioritized = pool.capacity === 0

  // TODO remove the nullish coalescor when the mergeDelayHours is mandatory
  const delayedAttendanceStart = addHours(attendanceStart, pool.mergeDelayHours ?? 24)
  const inPast = delayedAttendanceStart < new Date()

  return (
    <div
      className="flex flex-col w-full min-w-[5ch] p-2 bg-slate-3 rounded-lg text-center items-center font-medium"
      key={pool.id}
    >
      <p className="text-sm">{pool.title}</p>
      {isUnprioritized ? (
        <>
          <p>Åpner {formatRelativeTime(delayedAttendanceStart)}</p>
          {pool.numAttendees > 0 && <p>{pool.numAttendees} venter</p>}
        </>
      ) : (
        <p className="text-lg">
        {pool.numAttendees}/{pool.capacity}
      </p>
      )}
    </div>
  )
}
