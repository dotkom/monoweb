import { type UserService } from "../../user/user-service"
import { AttendanceRepository } from "../repositories"
import { _AttendancePoolService, _PoolServiceImpl } from "./attendance-pool-service"
import { _AttendanceService, _AttendanceServiceImpl } from "./attendance-service"
import { _AttendeeService, _AttendeeServiceImpl } from "./attendee-service"
import { _WaitlistAttendeService, _WaitlistAttendeServiceImpl } from "./waitlist-attendee-repository"

export interface AttendanceService {
  attendance: _AttendanceService
  pool: _AttendancePoolService
  waitlistAttendee: _WaitlistAttendeService
  attendee: _AttendeeService
}

export class AttendanceServiceImpl implements AttendanceService {
  attendance: _AttendanceService
  pool: _AttendancePoolService
  waitlistAttendee: _WaitlistAttendeService
  attendee: _AttendeeService

  constructor(attendanceRepository: AttendanceRepository, userService: UserService) {
    this.attendance = new _AttendanceServiceImpl(attendanceRepository)
    this.pool = new _PoolServiceImpl(attendanceRepository)
    this.waitlistAttendee = new _WaitlistAttendeServiceImpl(attendanceRepository)
    this.attendee = new _AttendeeServiceImpl(attendanceRepository, userService)
  }
}
