import { Generated } from "kysely";
import { Timestamp } from "./common";

type EventStatus = "private" | "public";

export interface EventTable {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  description: string | null;
  end: Timestamp;
  imageUrl: string | null;
  location: string | null;
  organizerID: string;
  public: boolean;
  start: Timestamp;
  status: EventStatus;
  subtitle: string | null;
  title: string;
  updatedAt: Timestamp;
}

export interface AttendanceTable {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  deregisterDeadline: Timestamp;
  end: Timestamp;
  eventID: string;
  // Has default value
  limit: Generated<number>;
  start: Timestamp;
  updatedAt: Timestamp;
}

export interface AttendeeTable {
  id: Generated<string>;
  attendanceID: string;
  createdAt: Generated<Timestamp>;
  eventID: string;
  updatedAt: Timestamp;
}

export interface CommitteeTable {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  name: string;
  updatedAt: Timestamp;
}

export interface CompanyTable {
  id: Generated<string>;
  name: string;
  description: string;
  email: string;
  website: string;
  phone: string | null;
  location: string | null;
  type: string | null;
}
