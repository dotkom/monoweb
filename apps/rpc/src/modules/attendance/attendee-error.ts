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
  constructor(userId: string, attendanceId: string) {
    super(
      PROBLEM_DETAILS.NotFound,
      `Attendee with user id '${userId}' not found in attendance with id '${attendanceId}'`
    )
  }
}
