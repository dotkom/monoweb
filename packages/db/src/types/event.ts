import { type Generated } from "kysely";

type EventStatus = "TBA" | "PUBLIC" | "NO_LIMIT" | "ATTENDANCE";
type EventType = "SOCIAL" | "COMPANY" | "ACADEMIC" | "BEDPRES";

export interface EventTable {
    id: Generated<string>;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
    title: string;
    start: Date;
    end: Date;
    status: EventStatus;
    type: EventType;
    public: boolean;
    description: string | null;
    subtitle: string | null;
    imageUrl: string | null;
    location: string | null;
    committeeId: string | null;
    waitlist: string | null;
}

export interface AttendanceTable {
    id: Generated<string>;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
    start: Date;
    end: Date;
    deregisterDeadline: Date;
    limit: number;
    eventId: string;
    min: number;
    max: number;
}

export interface AttendeeTable {
    id: Generated<string>;
    createdAt: Generated<Date>;
    updatedAt: Generated<Date>;
    userId: string;
    attendanceId: string;
}
