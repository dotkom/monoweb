import type { Event } from "@dotkomonline/types"
import type { FC } from "react"
import { LocationBox } from "./LocationBox"
import { TimeBox } from "./TimeBox"

interface TimeLocationBoxProps {
  event: Event
}

export const TimeLocationBox: FC<TimeLocationBoxProps> = ({ event }) => {
  return (
    <div className="flex flex-col bg-slate-2 rounded-3xl min-h-[6rem] p-6 gap-3">
      <h2 className="border-none">Oppmøte</h2>
      <div className="text-xs flex flex-col gap-6">
        <TimeBox event={event} />
        <LocationBox event={event} />
      </div>
    </div>
  )
}
