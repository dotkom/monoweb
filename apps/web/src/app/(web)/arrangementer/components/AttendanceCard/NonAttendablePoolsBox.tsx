import { RollingNumber } from "@/components/RollingNumber"
import {
  type AttendanceView,
  type AttendancePool,
  getAttendablePool,
  getNonAttendablePools,
  getQueuedAttendeeCount,
  getRegisteredAttendeeCount,
} from "@dotkomonline/rpc/attendance"
import type { User } from "@dotkomonline/rpc/user"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Text,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@dotkomonline/ui"
import { IconChevronDown, IconHourglassEmpty } from "@tabler/icons-react"

interface NonAttendablePoolsBoxProps {
  attendance: AttendanceView
  user: User | null
}

export const NonAttendablePoolsBox = ({ attendance, user }: NonAttendablePoolsBoxProps) => {
  if (!attendance.pools.length) {
    return <Text className="sm:px-3 text-sm">Ingen påmeldingsgrupper</Text>
  }

  const hasAttendablePool = getAttendablePool(attendance, user) !== null
  const nonAttendablePools = getNonAttendablePools(attendance, user)

  if (!nonAttendablePools.length) {
    return null
  }

  return (
    <Collapsible defaultOpen={!hasAttendablePool} className="w-full flex flex-col gap-1">
      <CollapsibleTrigger className="w-full flex items-center gap-2 sm:px-3 py-1 transition-colors text-muted-foreground hover:text-foreground">
        <Text className="text-sm">{hasAttendablePool ? "Andre påmeldingsgrupper" : "Påmeldingsgrupper"}</Text>
        <IconChevronDown className="size-4" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="flex flex-col gap-2 text-sm mb-1">
          {nonAttendablePools.map((pool) => (
            <AttendanceBoxPoolSmall key={pool.id} pool={pool} attendance={attendance} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface AttendanceBoxPoolSmallProps {
  pool: AttendancePool
  attendance: AttendanceView
}

const AttendanceBoxPoolSmall = ({ pool, attendance }: AttendanceBoxPoolSmallProps) => {
  const registeredAttendeeCount = getRegisteredAttendeeCount(attendance, pool.id)
  const queuedAttendeeCount = getQueuedAttendeeCount(attendance, pool.id)

  return (
    <div
      className="flex flex-row justify-between items-center py-2 sm:px-3 sm:bg-gray-50 sm:border sm:border-gray-200 sm:dark:bg-white/3 sm:dark:border-stone-700 sm:rounded-lg"
      key={pool.id}
    >
      <div className="flex flex-row gap-2 items-center">
        <Text>{pool.title}</Text>

        {pool.mergeDelayHours ? <DelayPill mergeDelayHours={pool.mergeDelayHours} /> : null}
      </div>

      <div className="flex flex-row gap-2 items-center">
        <Text>
          <RollingNumber value={registeredAttendeeCount} />
          {pool.capacity > 0 && (
            <>
              /<span className="font-mono">{pool.capacity}</span>
            </>
          )}
        </Text>

        {queuedAttendeeCount > 0 && (
          <Text className="text-gray-600 dark:text-stone-400">
            +<RollingNumber value={queuedAttendeeCount} /> i kø
          </Text>
        )}
      </div>
    </div>
  )
}

interface DelayPillProps {
  mergeDelayHours: number
}

const DelayPill = ({ mergeDelayHours }: DelayPillProps) => {
  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-1">
          <IconHourglassEmpty className="size-3.5" />
          <Text className="text-xs">{mergeDelayHours ? `${mergeDelayHours}t` : "TBD"}</Text>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <Text>Denne gruppen får plasser {mergeDelayHours} timer etter påmeldingsstart</Text>
      </TooltipContent>
    </Tooltip>
  )
}
