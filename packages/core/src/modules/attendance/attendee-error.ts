import { ApplicationError } from "../../error"
import { PROBLEM_DETAILS } from "../../http-problem-details"

export class AttendeeRegistrationError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.BadRequest, detail)
  }
}

export class AttendeeDeregistrationError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.BadRequest, detail)
  }
}

export class AttendeeWriteError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.BadRequest, detail)
  }
}

export class AttendeeNotFoundError extends ApplicationError {
  constructor(attendeeId: string, attendanceId?: string) {
    super(
      PROBLEM_DETAILS.NotFound,
      `Attendee with id '${attendeeId}' not found${attendanceId ? ` in attendance with id '${attendanceId}'` : ""}`
    )
  }
}

export class AttendeeAlreadyRegisteredError extends ApplicationError {
  constructor(attendeeId: string, attendanceId?: string) {
    super(
      PROBLEM_DETAILS.BadRequest,
      `Attendee with id '${attendeeId}' is already registered${attendanceId ? ` in attendance with id '${attendanceId}'` : ""}`
    )
  }
}

export class AttendeeReservationError extends ApplicationError {
  constructor(attendeeId: string) {
    super(PROBLEM_DETAILS.BadRequest, `Attendee with id '${attendeeId}' could not be reserved`)
  }
}
