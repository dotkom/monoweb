import { EventListItem } from "@/components/molecules/EventListItem";
import { type Event } from "@dotkomonline/types";
import { type FC } from "react";

interface EventListProps {
  events?: Array<Event>;
  isLoading: boolean;
  title: string;
}

// Temporary eventlist design
export const EventList: FC<EventListProps> = (props: EventListProps) => (
  <div className="w-full">
    <h2 className="border-none">{props.title}</h2>
    <ul className="mt-4 flex list-none flex-col gap-y-2">
      {props.isLoading ? (
        <p>Loading...</p>
      ) : (
        (props.events || []).map((event) => (
          <li key={event.id}>
            <EventListItem {...event} attending={1} max_attending={10}></EventListItem>
          </li>
        ))
      )}
    </ul>
  </div>
);
