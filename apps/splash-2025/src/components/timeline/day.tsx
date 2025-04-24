import type { TimeLineProps } from "@/data/timelineData"
import { Title } from "@dotkomonline/ui"
import type { FC } from "react"
import { Event } from "./event"

export const Day: FC<TimeLineProps> = ({ events }) => {
  const day = new Intl.DateTimeFormat("no-nb", { weekday: "long", month: "long", day: "2-digit" }).format(
    events[0].startDate
  )

  return (
    <div className="text-white">
      <Title element="h2">{day.replace(/^./, day[0].toUpperCase())}</Title>
      {events.map((e) => (
        <Event {...e} key={`event-${e.title}`} />
      ))}
    </div>
  )
}
