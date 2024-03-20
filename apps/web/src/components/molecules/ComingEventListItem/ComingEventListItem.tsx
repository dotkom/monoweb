import { Badge, Icon } from "@dotkomonline/ui";
import { trpc } from "@/utils/trpc";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Event, Attendance } from "@dotkomonline/types/src/event";

export interface AttendanceGroupProps {
    attendance: Attendance;
}

export const AttendanceGroup: React.FC<AttendanceGroupProps> = ({
    attendance,
}) => (
    <div className="grid grid-cols-2 gap-2 mb-2">
        <p>
            Klasse {attendance.min} - {attendance.max}
        </p>
        <p>
            <Icon icon="tabler:users-group" />
            {attendance.attendees.length}/{attendance.limit}
        </p>
    </div>
);

export interface ComingEventListItemProps {
    event: Event;
}

export const ComingEventListItem: React.FC<ComingEventListItemProps> = ({
    event,
}) => {
    const { data: attendance, isLoading } = trpc.attendance.get.useQuery({
        eventId: event.id,
    });

    return (
        <div className="flex flex-row w-full space-x-2 mb-5 hover:shadow-lg p-2">
            <Image
                src={event.imageUrl ?? ""}
                alt={event.title}
                width={100}
                height={100}
                className="object-cover rounded h-[100px] w-[132px]"
            />
            <div className="flex flex-col grow px-3">
                <div className="flex flex-row justify-between mb-2">
                    <p className="font-bold">{event.title}</p>
                    <Badge color="green" variant="solid">
                        {event.type}
                    </Badge>
                </div>
                <p className="m-0 inline-flex gap-1 items-center">
                    <Icon icon="tabler:calendar" />
                    {event.start.toLocaleDateString("nb-NO")}
                </p>
                <div className="flex flex-row justify-between h-full">
                    <p className="m-0 inline-flex gap-1 items-center">
                        <ul>
                            {attendance?.map((att) => (
                                <AttendanceGroup
                                    key={att.id}
                                    attendance={att}
                                />
                            ))}
                        </ul>
                    </p>
                    <Link href={`/events/${event.id}`} className="mt-auto">
                        {"Info >"}
                    </Link>
                </div>
            </div>
        </div>
    );
};
