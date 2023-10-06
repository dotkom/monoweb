import { type Generated } from "kysely";

type EventStatus = "ATTENDANCE" | "NO_LIMIT" | "PUBLIC" | "TBA";
type EventType = "ACADEMIC" | "BEDPRES" | "COMPANY" | "SOCIAL";

export interface EventTable {
  committeeId: null | string;
  createdAt: Generated<Date>;
  description: null | string;
  end: Date;
  id: Generated<string>;
  imageUrl: null | string;
  location: null | string;
  public: boolean;
  start: Date;
  status: EventStatus;
  subtitle: null | string;
  title: string;
  type: EventType;
  updatedAt: Generated<Date>;
  waitlist: null | string;
}

export interface AttendanceTable {
  createdAt: Generated<Date>;
  deregisterDeadline: Date;
  end: Date;
  eventId: string;
  id: Generated<string>;
  limit: number;
  max: number;
  min: number;
  start: Date;
  updatedAt: Generated<Date>;
}

export interface AttendeeTable {
  attendanceId: string;
  createdAt: Generated<Date>;
  id: Generated<string>;
  updatedAt: Generated<Date>;
  userId: string;
}
