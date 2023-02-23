import { FC } from "react"
import { useEventDetailsContext } from "./EventDetailsModal"

export const EventDetailsCommittees: FC = () => {
  const { event } = useEventDetailsContext()
  return <h1>Committees for {event.title}</h1>
}
