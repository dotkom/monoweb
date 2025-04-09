import type { AttendancePool } from "@dotkomonline/types"
import { Icon } from "@dotkomonline/ui"

interface Props {
  pool: AttendancePool
}

export const AttendanceBoxPoolSmall = ({ pool }: Props) => {
  if (!pool.isVisible) {
    return null
  }

  const unprioritizedIcon = <Icon icon="tabler:arrow-down" className="text-slate-8" />
  const isUnprioritized = pool.capacity === 0

  return (
    <div
      className="flex flex-col w-full min-w-[5ch] p-2 bg-slate-3 rounded-lg text-center items-center font-medium"
      key={pool.id}
    >
      {isUnprioritized ? (
        <div className="text-sm">
          {pool.title}
          {unprioritizedIcon}
        </div>
      ) : (
        <p className="text-sm">{pool.title}</p>
      )}
      <p className="text-lg">
        {pool.numAttendees}/{pool.capacity}
      </p>
    </div>
  )
}
