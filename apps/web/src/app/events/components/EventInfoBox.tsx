import type { Event } from "@dotkomonline/types"
import type { FC } from "react"

interface Props {
  event: Event
}

export const EventInfoBox: FC<Props> = ({ event }) => {
  return (
    <div className="mr-10 w-[70%]">
      <h2>{event.title}</h2>
      <p>{event.description}</p>
    </div>
  )
}
