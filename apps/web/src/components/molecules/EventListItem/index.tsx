import Link from "next/link";
import { type FC } from "react";

export interface EventListItemProps {
  attending: number;
  id: string;
  max_attending: number;
  start: Date;
  title: string;
  type: string;
}

// Temporary eventlistitem design
export const EventListItem: FC<EventListItemProps> = (props: EventListItemProps) => (
  <Link
    className="bg-blue-3 text-blue-12 hover:bg-blue-4 flex w-full cursor-pointer flex-row gap-x-2 rounded-md px-3 py-2"
    href={`/events/${props.id}`}
  >
    <div className="flex flex-row gap-x-4">
      <span className="flex-row-gap-x-4 flex">{props.type}</span>
      <p>{props.title}</p>
    </div>
    <div className="ml-auto">
      <span className="text-end">
        {props.attending}/{props.max_attending}
      </span>
    </div>
  </Link>
);
