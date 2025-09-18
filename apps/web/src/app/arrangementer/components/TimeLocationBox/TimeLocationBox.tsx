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
    <section className="flex flex-col gap-4 min-h-[6rem] rounded-lg sm:border sm:border-gray-200 sm:dark:border-stone-800 sm:dark:bg-stone-800 sm:p-4 sm:rounded-xl">
      <Title element="h2">Oppmøte</Title>
      <div className="flex flex-col gap-6">
        <TimeBox event={event} />
        <LocationBox event={event} />
      </div>
    </section>
  )
}
