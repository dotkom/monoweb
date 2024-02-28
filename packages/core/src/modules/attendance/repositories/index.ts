import { Kysely } from "kysely"
import { _AttendancePoolRepository, _PoolRepositoryImpl } from "./attendance-pool-repository"
import { _AttendanceRepository, _AttendanceRepositoryImpl } from "./attendance-repository"
import { _AttendeeRepository, _AttendeeRepositoryImpl } from "./attendee-repository"
import { _WaitlistAttendeRepository, _WaitlistAttendeRepositoryImpl } from "./waitlist-attendee-repository"
import { Database } from "@dotkomonline/db"

export interface AttendanceRepository {
  attendance: _AttendanceRepository
  pool: _AttendancePoolRepository
  waitlistAttendee: _WaitlistAttendeRepository
  attendee: _AttendeeRepository
}

export class AttendanceRepositoryImpl implements AttendanceRepository {
  attendance: _AttendanceRepository
  pool: _AttendancePoolRepository
  waitlistAttendee: _WaitlistAttendeRepository
  attendee: _AttendeeRepository
  constructor(db: Kysely<Database>) {
    this.attendance = new _AttendanceRepositoryImpl(db)
    this.pool = new _PoolRepositoryImpl(db)
    this.waitlistAttendee = new _WaitlistAttendeRepositoryImpl(db)
    this.attendee = new _AttendeeRepositoryImpl(db)
  }
}
