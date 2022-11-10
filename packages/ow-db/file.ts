import { ColumnType, RawBuilder } from "kysely";

export type EventStatus = "private" | "public";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string | RawBuilder, Date | string | RawBuilder>;

export interface _CompanyEvents {
  A: string;
  B: string;
}

export interface _PrismaMigrations {
  appliedStepsCount: Generated<number>;
  checksum: string;
  finishedAt: Timestamp | null;
  id: string;
  logs: string | null;
  migrationName: string;
  rolledBackAt: Timestamp | null;
  startedAt: Generated<Timestamp>;
}

export interface Account {
  accessToken: string | null;
  expiresAt: number | null;
  id: string;
  idToken: string | null;
  provider: string;
  providerAccountId: string;
  refreshToken: string | null;
  scope: string | null;
  sessionState: string | null;
  tokenType: string | null;
  type: string;
  userID: string;


}

export interface Attendance {
  createdAt: Generated<Timestamp>;
  deregisterDeadline: Timestamp;
  end: Timestamp;
  eventId: string;
  id: string;
  limit: Generated<number>;
  start: Timestamp;
  updatedAt: Timestamp;
}

export interface Attendee {
  attendanceId: string;
  createdAt: Generated<Timestamp>;
  eventId: string;
  id: string;
  updatedAt: Timestamp;
}

export interface Committee {
  createdAt: Generated<Timestamp>;
  id: string;
  name: string;
  updatedAt: Timestamp;
}

export interface Company {
  description: string;
  email: string;
  id: string;
  location: string | null;
  name: string;
  phone: string | null;
  type: string | null;
  website: string;
}

export interface Event {
  createdAt: Generated<Timestamp>;
  description: string | null;
  end: Timestamp;
  id: string;
  imageUrl: string | null;
  location: string | null;
  organizerId: string;
  public: boolean;
  start: Timestamp;
  status: EventStatus;
  subtitle: string | null;
  title: string;
  updatedAt: Timestamp;
}

export interface Session {
  expires: Timestamp;
  id: string;
  sessionToken: string;
  userId: string;
}

export interface User {
  createdAt: Generated<Timestamp>;
  email: string | null;
  emailVerified: Timestamp | null;
  id: string;
  image: string | null;
  name: string | null;
  password: string;
}

export interface VerificationToken {
  expires: Timestamp;
  identifier: string;
  token: string;
}

export interface DB {
  _CompanyEvents: _CompanyEvents;
  _PrismaMigrations: _PrismaMigrations;
  Account: Account;
  Attendance: Attendance;
  Attendee: Attendee;
  Committee: Committee;
  Company: Company;
  Event: Event;
  Session: Session;
  User: User;
  VerificationToken: VerificationToken;
}
