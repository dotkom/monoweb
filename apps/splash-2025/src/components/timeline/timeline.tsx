import type { TimeLineProps } from "@/data/timelineData"
import type { FC } from "react"
import { Day } from "./day"

export const Timeline: FC<TimeLineProps> = ({ events }) => {
  const days: TimeLineProps[] = [{ events }] // TODO: Actually seperate the days cuz I dunno how :(

  return (
    <div>
      {days.map((day) => (
        <Day {...day} key={day.events[0].startDate.toDateString()} />
      ))}
    </div>
  )
}
