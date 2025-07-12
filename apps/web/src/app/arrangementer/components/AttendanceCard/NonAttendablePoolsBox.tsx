import type { AttendancePool } from "@dotkomonline/types"
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
  pools: AttendancePool[]
  hasAttendablePool: boolean
}

export const NonAttendablePoolsBox = ({ pools, hasAttendablePool }: NonAttendablePoolsBoxProps) => {
  return (
    <Collapsible defaultOpen={!hasAttendablePool} className="w-full flex flex-col gap-1">
      <CollapsibleTrigger className="w-full flex items-center gap-2 py-1 font-medium hover:font-semibold [&[data-state=open]>iconify-icon]:rotate-90">
        <Text className="text-sm">{hasAttendablePool ? "Andre påmeldingsgrupper" : "Påmeldingsgrupper"}</Text>
        <Icon icon="tabler:chevron-right" className="transition-transform text-base -mt-[1px]" />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="flex flex-col gap-2 text-black text-sm mb-1">{pools.map(AttendanceBoxPoolSmall)}</div>
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
          <div className="flex items-center gap-0.5 px-1 py-0.5 rounded-md bg-slate-300 text-xs">
            <Icon icon="tabler:clock" />
            {mergeDelayHours ? <Text>{mergeDelayHours}t</Text> : <Text>TBD</Text>}
          </div>
        </TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

const AttendanceBoxPoolSmall = (pool: AttendancePool) => {
  return (
    <div className="flex flex-row justify-between items-center p-2 bg-slate-100 rounded-lg" key={pool.id}>
      <div className="flex flex-row gap-2 items-center">
        <Text>{pool.title}</Text>

        {Boolean(pool.mergeDelayHours) && <DelayPill mergeDelayHours={pool.mergeDelayHours} />}
      </div>

      <div className="flex flex-row gap-2 items-center">
        <Text>
          {pool.numAttendees}
          {pool.capacity > 0 && `/${pool.capacity}`}
        </Text>

        {pool.numUnreservedAttendees > 0 && <Text className="text-slate-900">+{pool.numUnreservedAttendees} i kø</Text>}
      </div>
    </div>
  )
}
