import type { Event } from "@dotkomonline/types"
import { Title } from "@dotkomonline/ui"
import type { FC } from "react"
import { Day } from "./day"

export type TimelineProps = {
  events: Event[]
}

export const Timeline: FC<TimelineProps> = ({ events }) => {
  const days: TimelineProps[] = [{ events }] // TODO: Actually seperate the days cuz I dunno how :(

  return (
    <div className="md:px-20 max-sm:px-10 text-white">
      <Title size="lg">Program</Title>
      {days.map((day) => (
        <Day {...day} key={day.events[0].start.toDateString()} />
      ))}
    </div>
  )
}
