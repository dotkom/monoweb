import type { TimelineProps } from "./timeline"
import { Title } from "@dotkomonline/ui"
import type { FC } from "react"
import { Event } from "./event"

export const Day: FC<TimelineProps> = ({ events }) => {
  const day = new Intl.DateTimeFormat("no-nb", { weekday: "long", month: "long", day: "2-digit" }).format(
    events[0].start
  )

  return (
    <div>
      <Title element="h2">{day.replace(/^./, day[0].toUpperCase())}</Title>
      {events.map((e) => (
        <Event {...e} key={`event-${e.title}`} />
      ))}
    </div>
  )
}
