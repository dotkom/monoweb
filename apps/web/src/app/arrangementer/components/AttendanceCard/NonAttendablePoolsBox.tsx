import type { Attendance, AttendancePool } from "@dotkomonline/types"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Icon,
  Text,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@dotkomonline/ui"

interface NonAttendablePoolsBoxProps {
  attendance: Attendance
  pools: AttendancePool[]
  hasAttendablePool: boolean
}

export const NonAttendablePoolsBox = ({ attendance, pools, hasAttendablePool }: NonAttendablePoolsBoxProps) => {
  return (
    <Collapsible defaultOpen={!hasAttendablePool} className="w-full flex flex-col gap-1">
      <CollapsibleTrigger className="w-full flex items-center gap-2 py-1 font-medium hover:font-semibold [&[data-state=open]>iconify-icon]:rotate-90">
        <Text className="text-sm">{hasAttendablePool ? "Andre påmeldingsgrupper" : "Påmeldingsgrupper"}</Text>
        <Icon icon="tabler:chevron-right" className="transition-transform text-base -mt-[1px]" />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="flex flex-col gap-2 text-sm mb-1">
          {pools.map((pool) => (
            <AttendanceBoxPoolSmall key={pool.id} pool={pool} attendance={attendance} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

const DelayPill = ({ mergeDelayHours }: { mergeDelayHours: number | null }) => {
  const content = mergeDelayHours ? (
    <Text>Denne gruppen får plasser {mergeDelayHours} timer etter påmeldingsstart</Text>
  ) : (
    <Text>Denne påmeldingsgruppen kan få plasser senere</Text>
  )

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-gray-200 dark:bg-stone-700 text-gray-900 dark:text-stone-100">
            <Icon icon="tabler:clock" className="text-sm" />
            <Text className="text-xs">{mergeDelayHours ? `${mergeDelayHours}t` : "TBD"}</Text>
          </div>
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface AttendanceBoxPoolSmallProps {
  pool: AttendancePool
  attendance: Attendance
}

const AttendanceBoxPoolSmall = ({ pool, attendance }: AttendanceBoxPoolSmallProps) => {
  const poolUnreservedAttendees = attendance.attendees.filter(
    (a) => a.attendancePoolId === pool.id && !a.reserved
  ).length
  const poolReservedAttendees = attendance.attendees.filter((a) => a.attendancePoolId === pool.id && a.reserved).length
  return (
    <div
      className="flex flex-row justify-between items-center p-2 bg-gray-50 border border-gray-50 dark:bg-transparent dark:border-stone-800 rounded-lg"
      key={pool.id}
    >
      <div className="flex flex-row gap-2 items-center">
        <Text>{pool.title}</Text>

        {Boolean(pool.mergeDelayHours) && <DelayPill mergeDelayHours={pool.mergeDelayHours} />}
      </div>

      <div className="flex flex-row gap-2 items-center">
        <Text>
          {poolReservedAttendees}
          {pool.capacity > 0 && `/${pool.capacity}`}
        </Text>

        {poolUnreservedAttendees > 0 && <Text className="text-gray-900">+{poolUnreservedAttendees} i kø</Text>}
      </div>
    </div>
  )
}
