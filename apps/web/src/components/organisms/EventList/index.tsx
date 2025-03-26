import { EventListItem } from "@/components/molecules/EventListItem"
import type { Event } from "@dotkomonline/types"
import type { FC } from "react"

interface EventListProps {
  events: Event[]
}

// Temporary eventlist design
export const EventList: FC<EventListProps> = (props: EventListProps) => (
  <div className="w-full">
    <ul className="mt-4 flex list-none flex-col gap-y-2">
      {(props.events || []).map((event) => (
        <li key={event.id}>
          <EventListItem {...event} attending={1} max_attending={10} />
        </li>
      ))}
    </ul>
  </div>
)
