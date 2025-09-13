import { ApplicationError } from "../../error.ts"
import { PROBLEM_DETAILS } from "../../http-problem-details.ts"

export class AttendanceNotFound extends ApplicationError {
  constructor(id: string) {
    super(PROBLEM_DETAILS.NotFound, `Attendance with id ${id} not found`)
  }
}

export class AttendanceValidationError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, detail)
  }
}

export class AttendanceDeletionError extends ApplicationError {
  constructor(detail: string) {
    super(PROBLEM_DETAILS.UnprocessableContent, detail)
  }
}

export class AttendeeHasNotPaidError extends ApplicationError {
  constructor(userId: string) {
    super(PROBLEM_DETAILS.NotFound, `Attendee with user id '${userId}' has not paid and cannot be refunded`)
  }
}
export class AttendeeAlreadyPaidError extends ApplicationError {
  constructor(userId: string) {
    super(PROBLEM_DETAILS.NotFound, `Attendee with user id '${userId}' has already paid, please refund them first`)
  }
}
