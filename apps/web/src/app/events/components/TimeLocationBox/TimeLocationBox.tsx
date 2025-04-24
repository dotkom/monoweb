import type { Event } from "@dotkomonline/types"
import { Title } from "@dotkomonline/ui"
import type { FC } from "react"
import { LocationBox } from "./LocationBox"
import { TimeBox } from "./TimeBox"

interface TimeLocationBoxProps {
  event: Event
}

export const TimeLocationBox: FC<TimeLocationBoxProps> = ({ event }) => {
  return (
    <div className="flex flex-col bg-slate-2 rounded-3xl min-h-[6rem] p-6 gap-3">
      <Title element="h2" className="font-poppins font-semibold text-2xl">
        Oppmøte
      </Title>
      <div className="flex flex-col gap-6">
        <TimeBox event={event} />
        <LocationBox event={event} />
      </div>
    </div>
  )
}
