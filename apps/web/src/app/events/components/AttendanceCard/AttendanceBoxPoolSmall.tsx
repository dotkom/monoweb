import type { AttendancePool } from "@dotkomonline/types"
import { Icon, Text } from "@dotkomonline/ui"

interface Props {
  pool: AttendancePool
}

export const AttendanceBoxPoolSmall = ({ pool }: Props) => {
  const unprioritizedIcon = <Icon icon="tabler:arrow-down" className="text-slate-8 mt-[2px]" />
  const isUnprioritized = pool.capacity === 0

  return (
    <div className="flex flex-col w-full min-w-[5ch] p-2 bg-slate-3 rounded-lg text-center items-center" key={pool.id}>
      {isUnprioritized ? (
        <div className="flex flex-row gap-1 text-sm">
          <Text className="font-normal">{pool.title}</Text>
          {unprioritizedIcon}
        </div>
      ) : (
        <Text className="text-sm font-normal">{pool.title}</Text>
      )}
      <Text className="text-lg">
        {pool.numAttendees}/{pool.capacity}
      </Text>
    </div>
  )
}
